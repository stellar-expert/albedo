import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import AccountContextView from '../account/account-context-view'
import SwapView from './swap/swap-view'
import TransferView from './transfer/transfer-view'
import LiquidityPoolsRouter from './pool/liquidity-pools-router'
import AddTrustlineView from './trustline/add-trustline-view'
import RemoveTrustlineView from './trustline/remove-trustline-view'
import ReceiveView from './receive/receive-view'
import ScanAutodetectView from './qr-reader/scan-autodetect-view'
import NotFound from '../pages/not-found-view'

export default function WalletRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/add-trustline`} component={AddTrustlineView}/>
            <Route path={`${path}/remove-trustline`} component={RemoveTrustlineView}/>
            <Route path={`${path}/receive`} component={ReceiveView}/>
            <Route path={`${path}/transfer`} component={TransferView}/>
            <Route path={`${path}/swap`} component={SwapView}/>
            <Route path={`${path}/liquidity-pool`} component={LiquidityPoolsRouter}/>
            <Route path={`${path}/scan`} component={ScanAutodetectView}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}