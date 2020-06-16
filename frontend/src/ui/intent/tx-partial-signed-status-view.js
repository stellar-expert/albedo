import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'

function TxPartialSignedStatusView() {
    const {txContext} = actionContext
    //available only for transaction-based intents
    if (!txContext) return null
    const totalSignatures = txContext.signatures.length
    if (totalSignatures === 0) return null
    if (txContext.isFullySigned) return null
    const sigCount = `${totalSignatures} signature${totalSignatures === 1 ? '' : 's'}`
    //show status
    return <div className="dimmed space text-small">
        The transaction needs more signatures to match the required threshold
        – {sigCount} so far.
    </div>
}

export default observer(TxPartialSignedStatusView)