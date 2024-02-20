import React from 'react'
import {Networks} from '@stellar/stellar-base'
import WcPendingRequestLayoutView from './wc-pending-request-layout-view'
import TxDetailsView from '../../intent/tx/tx-details-view'
import accountManager from '../../../state/account-manager'

export default function WcPendingTxRequestView({request, compact}) {
    const account = accountManager.get(request.pubkey)
    if (!account)
        return <WcPendingRequestLayoutView request={request}>
            <i className="icon icon-warning color-danger"/> Requested account not found
        </WcPendingRequestLayoutView>
    return <WcPendingRequestLayoutView request={request}>
        <h3 style={{margin: 0}}>Sign transaction</h3>
        <div className="micro-space">
            <span className="dimmed">using account </span>{account.displayName}
        </div>
        <div className="micro-space">
            <TxDetailsView xdr={request.xdr} network={Networks[request.network.toUpperCase()]} account={account} compact={compact}/>
        </div>
    </WcPendingRequestLayoutView>
}