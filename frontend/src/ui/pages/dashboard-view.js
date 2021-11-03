import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import Intro from './intro-view'
import AccountDashboardView from '../wallet/balance/account-dashboard-view'

function DashboardPageView() {
    if (!accountManager.activeAccount) return <Intro/>
    return <AccountDashboardView account={accountManager.activeAccount} />
}

export default observer(DashboardPageView)