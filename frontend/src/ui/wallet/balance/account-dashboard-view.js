import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Tabs, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import AccountActivityView from '../../account/account-activity-view'
import AccountContextView from '../../account/account-context-view'
import AllAccountBalancesView from './account-all-balances-view'
import PendingClaimableBalancesView from './pending-claimable-balances-view'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import '../notifications/noification-counter.scss'
import AccountNotificationCounterView from '../notifications/account-notification-counter-view'

function AccountDashboardView() {
    const [fundingInProgress, setFundingInProgress] = useState(false),
        network = useStellarNetwork()

    if (fundingInProgress) return <AccountContextView>
        <div className="loader"/>
        <div className="text-tiny text-center dimmed">Creating account...</div>
    </AccountContextView>

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(accountLedgerData.address)
            .then(() => new Promise(r => setTimeout(r, 5000)))
            .then(() => accountLedgerData.loadAccountInfo())
            .finally(() => setFundingInProgress(false))
    }

    return <AccountContextView>
        {accountLedgerData.nonExisting && <div className="text-tiny segment space text-center">
            Account doesn't exist on the ledger.
            <br/>
            You need to fund it with XLM in order to send/receive assets.
            {network === 'testnet' && <div>
                <a href="#" onClick={createTestnetAccount}>Fund test account automatically?</a>
            </div>}
        </div>}
        <Tabs queryParam="section" tabs={[
            {
                name: 'balances',
                title: 'Balances',
                isDefault: true,
                render: () => <AllAccountBalancesView/>
            },
            {
                name: 'claimable',
                title: <>Pending<AccountNotificationCounterView type="cb"/></>,
                render: () => <PendingClaimableBalancesView/>
            },
            {
                name: 'history',
                title: <>History<AccountNotificationCounterView type="op"/></>,
                render: () => <AccountActivityView ledgerData={accountLedgerData}/>
            }]}/>
    </AccountContextView>
}

export default observer(AccountDashboardView)