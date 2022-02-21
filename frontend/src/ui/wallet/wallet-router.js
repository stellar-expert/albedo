import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import AccountContextView from '../account/account-context-view'
import SwapView from './swap/swap-view'
import TransferView from './transfer/transfer-view'
import LiquidityPoolsRouter from './pool/liquidity-pools-router'
import AddTrustlineView from './balance/add-trustline-view'
import NotFound from '../pages/not-found-view'

export default function WalletRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/swap`} component={SwapView}/>
            <Route path={`${path}/transfer`} component={TransferView}/>
            <Route path={`${path}/add-trustline`} component={AddTrustlineView}/>
            <Route path={`${path}/liquidity-pool`} component={LiquidityPoolsRouter}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}