import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import ActionsBlock from '../components/actions-block'
import {formatAddress} from '../../util/formatter'
import {useDependantState} from '../../state/state-hooks'

function getConfirmationAccountName(alreadySigned) {
    const confirmation = alreadySigned ? 'Already signed by ' : 'Confirm using '
    if (accountManager.activeAccount) return confirmation + accountManager.activeAccount.shortDisplayName
    if (actionContext.directKeyInput) return confirmation + `account ${formatAddress(accountManager.selectedPublicKey, 8)}`
    return confirmation + 'Albedo account'
}

function PendingStatus({children}) {
    return <div className="text-center">
        <div className="loader small"/>
        <div className="dimmed text-small">{children}</div>
        <div className="space"/>
    </div>
}

function IntentActionView() {
    const {
            txContext,
            intentErrors,
            confirmed,
            response,
            autoSubmitToHorizon,
            requiresExistingAccount,
            selectedAccountInfo,
            selectedPublicKey,
            hasNoMatchingKey,
            runtimeErrors,
            dispatchingResponse,
            directKeyInput
        } = actionContext,
        {activeAccount} = accountManager,
        alreadySigned = txContext && selectedPublicKey && txContext.findSignatureByKey(selectedPublicKey),
        [signingInProgress, setSigningInProgress] = useDependantState(() => false, [selectedPublicKey, alreadySigned]),
        accountUnavailable = !selectedPublicKey || hasNoMatchingKey || requiresExistingAccount && (!selectedAccountInfo || selectedAccountInfo.error),
        inProgress = confirmed && !intentErrors && !alreadySigned && signingInProgress,
        externalSignature = confirmed && activeAccount?.isHWAccount && !txContext?.isFullySigned,
        pendingHorizonSubmission = confirmed && autoSubmitToHorizon && txContext?.isFullySigned && !response

    if (dispatchingResponse) return <ActionsBlock>
        <PendingStatus>Processing response…</PendingStatus>
    </ActionsBlock>

    if (intentErrors) return <ActionsBlock>
        <button className="button button-outline button-block" onClick={() => actionContext.rejectRequest()}>
            Proceed
        </button>
    </ActionsBlock>

    return <ActionsBlock>
        {externalSignature && <PendingStatus>Confirm the action on the hardware wallet</PendingStatus>}
        {pendingHorizonSubmission && <PendingStatus>Submitting to Horizon…</PendingStatus>}
        {!!runtimeErrors && <div className="space">
            <div className="error text-small">{runtimeErrors}</div>
        </div>}
        {!directKeyInput &&
        <button className="button button-block" disabled={alreadySigned || accountUnavailable || inProgress}
                onClick={() => {
                    setSigningInProgress(true)
                    actionContext.confirmRequest()
                }}>
            {getConfirmationAccountName(alreadySigned)}
        </button>
        }
        {!!txContext?.isPartiallySigned &&
        <button className="button button-outline button-block" onClick={() => actionContext.finalize()}>
            Proceed with partially signed tx
        </button>}
        {' '}
        <button className="button button-outline button-block" disabled={!!dispatchingResponse}
                onClick={() => actionContext.rejectRequest()}>Reject
        </button>
    </ActionsBlock>
}

//TODO: ensure that pressing "Reject" stops the action being processed right now (or block this button)

export default observer(IntentActionView)