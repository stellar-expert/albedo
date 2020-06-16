import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import ActionsBlock from '../components/actions-block'

function ConfirmIntentView() {
    const {txContext, intentErrors, confirmed, isFinalized, autoSubmitToHorizon} = actionContext,
        sendPartiallySigned = txContext && txContext.signatures.length > 0 && !txContext.isFullySigned

    return <ActionsBlock>
        {confirmed && !intentErrors && (!txContext || txContext.isFullySigned) && <div className="text-center">
            <div className="loader"/>
            <div className="dimmed text-small">
                {autoSubmitToHorizon ? 'Submitting to Horizon…' : 'Redirecting…'}
            </div>
            <div className="space"/>
        </div>}
        {!intentErrors && <button className="button button-block" disabled={confirmed}
                                  onClick={() => actionContext.confirmRequest()}>
            Confirm using {accountManager.activeAccount.shortDisplayName}
        </button>}
        {sendPartiallySigned && <button className="button button-outline button-block" disabled={confirmed}
                                        onClick={() => actionContext.finalize()}>
            Proceed with partially signed transaction
        </button>}
        {' '}
        <button className="button button-outline button-block" disabled={isFinalized}
                onClick={() => actionContext.rejectRequest()}>
            Reject
        </button>
    </ActionsBlock>
}

//TODO: ensure that pressing "Reject" stops the action being processed right now (or block this button)

export default observer(ConfirmIntentView)