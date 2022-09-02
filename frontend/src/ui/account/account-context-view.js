import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, CopyToClipboard, useStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../state/account-manager'
import AccountSelectorView from '../wallet/balance/account-selector-view'
import NetworkSelectorView from '../wallet/balance/network-selector-view'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'
import AccountNavMenu from './account-nav-menu'
import './account-context.scss'

function AccountContextView({children, actionMode = false}) {
    const {activeAccount} = accountManager,
        network = useStellarNetwork()
    if (!activeAccount) {
        navigation.navigate('/')
        return null
    }

    useEffect(() => {
        accountLedgerData.init(activeAccount.publicKey, network)
        return function () {
            accountLedgerData.finalize()
        }
    }, [network, activeAccount.publicKey])

    return <div>
        <h2><AccountSelectorView actionMode={actionMode}/></h2>
        <div className="dual-layout">
            <div className="nowrap">
                <AccountAddress account={activeAccount.publicKey} chars={12} title="Account address" icon={false}/>
                <CopyToClipboard text={activeAccount.publicKey} title="Copy public key to clipboard"/>
            </div>
            <div className="text-right"><NetworkSelectorView/></div>
        </div>
        {!actionMode && <AccountNavMenu/>}
        {children}
    </div>
}

export default observer(AccountContextView)