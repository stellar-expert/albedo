import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import {addVisibilityChangeListener} from '@stellar-expert/ui-framework'
import wcPendingRequests from '../../../state/wc-pending-requests'
import WcPendingPairingRequestView from './wc-pending-pairing-request-view'
import WcPendingTxRequestView from './wc-pending-tx-request-view'
import WcRequestActionsView from './wc-request-actions-view'
import WcRequestParser from './wc-request-parser'
import {navigation} from '@stellar-expert/navigation'

function resolveComponent(method) {
    switch (method) {
        case 'pair':
            return WcPendingPairingRequestView
        default:
            return WcPendingTxRequestView
    }
}

function createEntry(request, order) {
    return React.createElement(resolveComponent(request.method), {
        request,
        compact: order !== 0
    })
}

export default observer(function WcPendingRequestsView() {
    const {requests} = wcPendingRequests
    const next = requests.length > 1 ?
        '/wallet-connect/request' :
        requests[0]?.method === 'pair' ?
            '/wallet-connect/connect/success' :
            '/account'

    function refresh() {
        wcPendingRequests.fetch()
            .then(() => {
                if (!wcPendingRequests.requests.length) {
                    navigation.navigate('/account')
                }
            })
    }

    useEffect(() => {
        addVisibilityChangeListener(isActive => isActive && refresh())
        refresh()
    }, [])

    function createElement(request, i) {
        const parsedRequest = new WcRequestParser(request).processRequest()
        return (<div key={parsedRequest.id}>
            {i > 0 && <hr />}
            {createEntry(parsedRequest, i)}
            {i === 0 && <WcRequestActionsView request={parsedRequest} className="micro-space" nextUrl={next} />}
        </div>)
    }

    return <div>
        <h2>WalletConnect requests</h2>
        <div className="space">
            {!requests.length && <div className="text-center dimmed text-small double-space">
                (no pending WalletConnect requests)
            </div>}
            {requests.map((request, i) => createElement(request, i))}
        </div>
    </div>
})