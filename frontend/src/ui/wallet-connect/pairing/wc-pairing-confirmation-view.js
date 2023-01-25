import React from 'react'
import AccountContextView from '../../account/account-context-view'
import WcPendingPairingRequestView from '../request/wc-pending-pairing-request-view'
import WcRequestActionsView from '../request/wc-request-actions-view'
import WcRequestParser from '../request/wc-request-parser'

export default function WcPairingConfirmationView({pairingRequest}) {
    const parsedRequest = new WcRequestParser(pairingRequest).processRequest()
    return <AccountContextView>
        <WcPendingPairingRequestView request={parsedRequest}/>
        <WcRequestActionsView request={parsedRequest} className="space" nextUrl="/wallet-connect/connect/success"/>
    </AccountContextView>
}