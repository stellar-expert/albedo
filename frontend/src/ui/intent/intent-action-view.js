import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {Button, useDependantState} from '@stellar-expert/ui-framework'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import {formatAddress} from '../../util/formatter'
import IntentErrorView from './intent-error-view'

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
            intent,
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
        accountUnavailable = !selectedPublicKey || hasNoMatchingKey || (requiresExistingAccount && intent !== 'tx') && (!selectedAccountInfo || selectedAccountInfo.error),
        inProgress = confirmed && !intentErrors && !alreadySigned && signingInProgress,
        externalSignature = confirmed && activeAccount?.isHWAccount && !txContext?.isFullySigned,
        pendingHorizonSubmission = confirmed && autoSubmitToHorizon && txContext?.isFullySigned && !response

    if (dispatchingResponse) return <div>
        <PendingStatus>Processing response…</PendingStatus>
    </div>

    if (intentErrors) return <div>
        <Button block outline onClick={() => actionContext.rejectRequest()}>Proceed</Button>
    </div>

    return <div>
        {externalSignature && <PendingStatus>Confirm the action on the hardware wallet</PendingStatus>}
        {pendingHorizonSubmission && <PendingStatus>Submitting to Horizon…</PendingStatus>}
        {!!runtimeErrors && <div className="space">
            <IntentErrorView/>
            <div className="micro-space"/>
        </div>}
        {!directKeyInput &&
        <Button block disabled={alreadySigned || accountUnavailable || inProgress} onClick={() => {
            setSigningInProgress(true)
            actionContext.confirmRequest()
        }}>{getConfirmationAccountName(alreadySigned)}</Button>
        }
        {!!txContext?.isPartiallySigned &&
        <Button block outline onClick={() => actionContext.finalize()}>
            Proceed with partially signed tx
        </Button>}
        {' '}
        <Button block outline disabled={!!dispatchingResponse} onClick={() => actionContext.rejectRequest()}>Reject
        </Button>
    </div>
}

//TODO: ensure that pressing "Reject" stops the action being processed right now (or block this button)

export default observer(IntentActionView)