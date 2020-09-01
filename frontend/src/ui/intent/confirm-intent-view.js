import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import ActionsBlock from '../components/actions-block'

function ConfirmIntentView() {
    const {txContext, intentErrors, confirmed, isFinalized, autoSubmitToHorizon, requiresExistingAccount, selectedAccountInfo, selectedPublicKey, directKeyInput} = actionContext,
        alreadySigned = txContext && txContext.findSignatureByKey(selectedPublicKey),
        accountUnavailable = !selectedPublicKey || requiresExistingAccount && (!selectedAccountInfo || selectedAccountInfo.error),
        signButtonVisible = !directKeyInput && !intentErrors,
        sendPartiallySigned = txContext && txContext.signatures.length > 0 && !txContext.isFullySigned

    return <ActionsBlock>
        {confirmed && !intentErrors && (!txContext || txContext.isFullySigned) && <div className="text-center">
            <div className="loader small"/>
            <div className="dimmed text-small">
                {autoSubmitToHorizon ? 'Submitting to Horizon…' : 'Redirecting…'}
            </div>
            <div className="space"/>
        </div>}
        {signButtonVisible && <button className="button button-block" disabled={alreadySigned || accountUnavailable}
                                      onClick={() => actionContext.confirmRequest()}>
            Confirm using{' '}
            {accountManager.activeAccount ? accountManager.activeAccount.shortDisplayName : 'Albedo account'}
        </button>}
        {signButtonVisible && sendPartiallySigned && <button className="button button-outline button-block"
                                                             onClick={() => actionContext.finalize()}>
            Proceed with partially signed tx
        </button>}
        {' '}
        <button className="button button-outline button-block" disabled={isFinalized}
                onClick={() => actionContext.rejectRequest()}>
            {intentErrors ? 'Proceed' : 'Reject'}
        </button>
    </ActionsBlock>
}

//TODO: ensure that pressing "Reject" stops the action being processed right now (or block this button)

export default observer(ConfirmIntentView)