import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import NotFound from '../pages/not-found-view'
import SwapView from './swap/swap-view'
import AccountContextView from '../account/account-context-view'
import TransferView from './transfer/transfer-view'

export default function WalletRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/swap`} component={SwapView}/>
            <Route path={`${path}/transfer`} component={TransferView}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}