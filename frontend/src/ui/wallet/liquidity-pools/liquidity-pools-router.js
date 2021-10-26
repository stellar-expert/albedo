import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import NotFound from '../../pages/not-found-view'
import Deposit from './liquidity-pool-deposit-view'
import AccountContextView from '../../account/account-context-view'

export default function LiquidityPoolsRouter() {
    const {path} = useRouteMatch()
    return <AccountContextView>
        <Switch>
            <Route path={`${path}/withdraw`} component={Deposit}/>
            <Route component={NotFound}/>
        </Switch>
    </AccountContextView>
}