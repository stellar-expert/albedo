import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import NotFound from '../../pages/not-found-view'
import DepositView from './liquidity-pool-deposit-view'
import WithdrawView from './liquidity-pool-withdraw-view'

export default function LiquidityPoolsRouter() {
    const {path} = useRouteMatch()
    return <Switch>
        <Route path={`${path}/deposit`} component={DepositView}/>
        <Route path={`${path}/withdraw`} component={WithdrawView}/>
        <Route component={NotFound}/>
    </Switch>
}