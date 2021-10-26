import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import AccountContextView from '../account/account-context-view'
import SwapView from './swap/swap-view'
import TransferView from './transfer/transfer-view'
import Deposit from './liquidity-pools/liquidity-pool-deposit-view'
import NotFound from '../pages/not-found-view'

export default function WalletRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/swap`} component={SwapView}/>
            <Route path={`${path}/transfer`} component={TransferView}/>
            <Route path={`${path}/deposit`} component={Deposit}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}