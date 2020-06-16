import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import AccountSelectorView from './account-selector-view'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import AccountAddress from '../components/account-address'
import AccountLedgerDataView from './account-ledger-info-view'
import NetworkSelectorView from './network-selector-view'
import AccountActivityView from '../account/account-activity-view'

function AccountDashboardView() {
    const account = accountManager.activeAccount
    if (!account) {
        __history.push('/')
        return null
        return <div>
            <h2>Welcome</h2>
            <div className="space">

            </div>
        </div>
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
        <div className="space">
            <h3>Balances</h3>
            <AccountLedgerDataView address={account.publicKey}/>
        </div>
        <div className="space"/>
        <hr className="space"/>
        <AccountActivityView address={account.publicKey}/>
    </div>
}

export default observer(AccountDashboardView)