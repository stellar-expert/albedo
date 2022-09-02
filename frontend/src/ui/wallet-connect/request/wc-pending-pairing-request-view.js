import React, {Fragment} from 'react'
import WcPendingRequestLayoutView from './wc-pending-request-layout-view'

export default function WcPendingPairingRequestView({request}) {
    return <WcPendingRequestLayoutView request={request}>
        <h3 style={{margin: 0}}>Connect account</h3>
        <div className="micro-space">
            Stellar network{request.networks.length > 1 && 's'}:{' '}
            {request.networks.map((n, i) => <Fragment key={n}>
                {i > 0 && <> and </>}
                <b>{n}</b>
            </Fragment>)}
            <div>
                Permissions:
                {request.methods.map(m => <div key={m}><i className="icon icon-angle-right"/> {m}</div>)}
            </div>
        </div>
    </WcPendingRequestLayoutView>
}