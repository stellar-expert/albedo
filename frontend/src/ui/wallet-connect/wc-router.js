import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import AccountContextView from '../account/account-context-view'
import WcPairView from './pairing/wc-pair-view'
import WcPendingRequestsView from './request/wc-pending-requests-view'
import WcSessionsView from './session/wc-sessions-view'
import WcPairingSuccessView from './pairing/wc-pairing-success-view'
import NotFound from '../pages/not-found-view'

export default function WcRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/connect/success`} component={WcPairingSuccessView}/>
            <Route path={`${path}/connect`} component={WcPairView}/>
            <Route path={`${path}/request`} component={WcPendingRequestsView}/>
            <Route path={`${path}/session`} component={WcSessionsView}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}