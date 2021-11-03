import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Tabs} from '@stellar-expert/ui-framework'
import AccountActivityView from '../../account/account-activity-view'
import AccountContextView from '../../account/account-context-view'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import AllAccountBalancesView from './account-all-balances-view'

function AccountDashboardView() {
    const [tab, setTab] = useState('balance')
    return <>
        <Tabs tabs={[
            {
                name: 'balance',
                title: 'Balances',
                render: () => <AllAccountBalancesView ledgerData={accountLedgerData}/>
            },
            {
                name: 'activity',
                title: 'Activity',
                render: () => <AccountActivityView ledgerData={accountLedgerData}/>
            }]} selectedTab={tab} onChange={tab => setTab(tab)}/>
    </>
}

export default observer(() => <AccountContextView><AccountDashboardView/></AccountContextView>)