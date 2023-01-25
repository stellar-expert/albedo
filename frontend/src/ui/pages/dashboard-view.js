import React from 'react'
import {observer} from 'mobx-react'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../state/account-manager'
import AccountDashboardView from '../wallet/balance/account-dashboard-view'

function DashboardPageView() {
    if (!accountManager.activeAccount) {
        navigation.navigate('/intro')
        return <div className="loader"/>
    }
    return <AccountDashboardView account={accountManager.activeAccount}/>
}

export default observer(DashboardPageView)