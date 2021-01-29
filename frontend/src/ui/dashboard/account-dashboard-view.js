import React, {useState} from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import AccountSelectorView from './account-selector-view'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import AccountAddress from '../components/account-address'
import AccountLedgerDataView from './account-ledger-info-view'
import NetworkSelectorView from './network-selector-view'
import AccountActivityView from '../account/account-activity-view'
import {useDependantState} from '../../state/state-hooks'
import AccountLedgerData from '../../state/account-ledger-data'
import {useStellarNetwork} from '../../state/network-selector'
import Tabs from '../components/tabs'

function AccountDashboardView() {
    const [tab, setTab] = useState('balance'),
        account = accountManager.activeAccount,
        currentNetwork = useStellarNetwork()

    if (!account) {
        __history.push('/')
        return null
    }
    const [accountLedgerData] = useDependantState(() => {
        if (!account) return null
        const data = new AccountLedgerData(account.publicKey, currentNetwork)
        data.init()
        return data
    }, [account.publicKey, currentNetwork], () => {
        if (accountLedgerData) {
            accountLedgerData.finalize()
        }
    })

    let walletLink = 'https://accountviewer.stellar.org'
    if (currentNetwork === 'testnet') {
        walletLink += '?testnet=true'
    }
    return <div>
        <h2><AccountSelectorView/></h2>
        <div className="dual-layout">
            <div>
                <span className="dimmed">Address: </span>
                <span className="nowrap">
                    <AccountAddress account={account.publicKey} chars={8}/>
                    <CopyToClipboard text={account.publicKey}>
                        <a href="#" className="fa fa-copy active-icon" title="Copy public key to clipboard"/>
                    </CopyToClipboard>
                        </span>
            </div>
            <div className="text-right"><NetworkSelectorView/></div>
        </div>

        <div className="dual-layout space">
            <a href={walletLink} target="_blank" className="button button-block">Transfer funds</a>
            <a href="/account-settings" className="button button-block">Account settings</a>
        </div>
        <Tabs tabs={[
            {
                name: 'balance',
                title: 'Balances',
                render: () => <AccountLedgerDataView ledgerData={accountLedgerData}/>
            },
            {
                name: 'activity',
                title: 'Activity',
                render: () => <AccountActivityView ledgerData={accountLedgerData}/>
            }]} selectedTab={tab} onChange={tab => setTab(tab)}/>
    </div>
}

export default observer(AccountDashboardView)