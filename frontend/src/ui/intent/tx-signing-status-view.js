import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'

function TxSigningStatusView() {
    const {txContext} = actionContext
    //available only for transaction-based intents
    if (!txContext) return null
    const totalSignatures = txContext.signatures.length
    if (totalSignatures === 0) return null
    const sigCount = `${totalSignatures} signature${totalSignatures === 1 ? '' : 's'}`
    //show status
    if (txContext.isFullySigned) return <div>
        <div className="dimmed space text-small">
            <i className="fa fa-check text-small"/>{' '}
            The transaction is signed ({sigCount}) and ready for submission.
        </div>
        <button className="button" onClick={e => actionContext.finalize()}>Submit</button>
    </div>
    return <div className="dimmed space text-small">
        The transaction needs more signatures to match the required threshold
        – {sigCount} so far.
    </div>
}

export default observer(TxSigningStatusView)