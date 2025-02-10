import React from 'react'
import {observer} from 'mobx-react'
import {Button, useDependantState} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import actionContext, {ActionContextStatus} from '../../state/action-context'
import IntentErrorView from './intent-error-view'

function getConfirmationAccountName(account, alreadySigned) {
    const confirmation = alreadySigned ? 'Already signed by ' : 'Confirm using '
    if (account?.isEphemeral) return confirmation + `account ${shortenString(account.publicKey, 12)}`
    if (account) return confirmation + account.shortDisplayName
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
            status,
            response,
            autoSubmitToHorizon,
            requiresExistingAccount,
            selectedAccount,
            selectedAccountInfo,
            runtimeErrors
        } = actionContext,
        selectedPublicKey = selectedAccount?.publicKey,
        alreadySigned = txContext && selectedAccount && txContext.findSignatureByKey(selectedPublicKey),
        [signingInProgress, setSigningInProgress] = useDependantState(() => false, [selectedPublicKey, alreadySigned]),
        accountUnavailable = !selectedPublicKey || (requiresExistingAccount && intent !== 'tx' && (!selectedAccountInfo || selectedAccountInfo.error)),
        inProgress = [ActionContextStatus.confirmed, ActionContextStatus.processed].includes(status) && !intentErrors && !alreadySigned && signingInProgress,
        pendingHorizonSubmission = status >= ActionContextStatus.processed && status < ActionContextStatus.submitted && autoSubmitToHorizon && txContext?.isFullySigned && !response

    if (status >= ActionContextStatus.processed) return <div>
        <PendingStatus>Processing response…</PendingStatus>
    </div>

    if (intentErrors) return <div>
        <Button block outline onClick={() => actionContext.rejectRequest()}>Proceed</Button>
    </div>

    function confirm() {
        setSigningInProgress(true)
        actionContext.confirmRequest()
    }

    return <div>
        {pendingHorizonSubmission && <PendingStatus>Submitting to Horizon…</PendingStatus>}
        {!!runtimeErrors && <div className="space">
            <IntentErrorView/>
            <div className="micro-space"/>
        </div>}
        <Button block disabled={alreadySigned || accountUnavailable || inProgress} onClick={confirm}>
            {getConfirmationAccountName(selectedAccount, alreadySigned)}</Button>
        {' '}
        <Button block outline disabled={status >= ActionContextStatus.processed}
                onClick={() => actionContext.rejectRequest()}>Reject</Button>
    </div>
}

//TODO: ensure that pressing "Reject" stops the action being processed right now (or block this button)

export default observer(IntentActionView)