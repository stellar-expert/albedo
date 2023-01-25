import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Tabs} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import accountManager from '../../../state/account-manager'
import AccountActivityView from '../../account/account-activity-view'
import AccountContextView from '../../account/account-context-view'
import AccountNotificationCounterView from '../notifications/account-notification-counter-view'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import PendingClaimableBalancesView from './pending-claimable-balances-view'
import AllAccountBalancesView from './account-all-balances-view'

const accountTabs = {
    balances: () => <AllAccountBalancesView/>,
    claimable: () => <PendingClaimableBalancesView account={accountManager.activeAccount.publicKey} ledgerData={accountLedgerData}/>,
    history: () => <AccountActivityView ledgerData={accountLedgerData}/>
}

export default observer(function AccountDashboardView() {
    const [tab, setTab] = useState('balances')

    return <AccountContextView>
        <WalletOperationsWrapperView title="Balances">
            <Tabs right onChange={setTab} selectedTab={tab} tabs={[
                {
                    name: 'balances',
                    title: 'Active',
                    isDefault: true
                },
                {
                    name: 'claimable',
                    title: <>Pending<AccountNotificationCounterView type="cb"/></>
                },
                {
                    name: 'history',
                    title: <>History<AccountNotificationCounterView type="op"/></>
                }]}/>
            {accountTabs[tab]()}
        </WalletOperationsWrapperView>
    </AccountContextView>
})