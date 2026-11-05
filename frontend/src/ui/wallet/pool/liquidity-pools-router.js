import React from 'react'
import {Route, RouterSwitch, useRouteMatch} from '@stellar-expert/ui-framework'
import NotFound from '../../pages/not-found-view'
import DepositView from './liquidity-pool-deposit-view'
import WithdrawView from './liquidity-pool-withdraw-view'

export default function LiquidityPoolsRouter() {
    const {path} = useRouteMatch()
    return <RouterSwitch>
        <Route path={`${path}/deposit`} component={DepositView}/>
        <Route path={`${path}/withdraw`} component={WithdrawView}/>
        <Route component={NotFound}/>
    </RouterSwitch>
}