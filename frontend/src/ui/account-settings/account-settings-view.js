import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import Dropdown from '../components/dropdown'
import Tabs from '../components/tabs'
import AccountSecuritySectionView from './account-security-section-view'
import AccountKeypairsSectionView from './account-keypairs-section-view'

function handleAccountAction(action) {
    switch (action) {
        case 'login':
            __history.push('/login')
            break
        case 'signup':
            __history.push('/signup')
            break
        default:
            const account = accountManager.accounts.find(a => a.id === action)
            if (account) {
                accountManager.setActiveAccount(account)
            }
            break
    }
}

function AccountSettingsView() {
    const {activeAccount, accounts: allAccounts} = accountManager
    if (!activeAccount) {
        __history.push('/login')
        return <div>No account context.</div>
    }
    const dropdownOptions = [{
        value: 'title',
        title: activeAccount.displayName
    }]

    for (let account of allAccounts) {
        if (account === activeAccount) continue
        dropdownOptions.push({
            value: account.id,
            title: `Switch to ${account.displayName}`
        })
    }

    dropdownOptions.push({
        value: ''
    })

    dropdownOptions.push({
        value: 'login',
        title: 'Log in to another Albedo account'
    })

    dropdownOptions.push({
        value: 'signup',
        title: 'Create new Albedo account'
    })
    return <div>
        <h2>Account settings for{' '}
            <Dropdown className="dimmed" value="title" onChange={handleAccountAction} options={dropdownOptions}/>
        </h2>

        <Tabs tabs={[
            {name: 'keypairs', title: 'Signing keys', isDefault: true, render: () => <AccountKeypairsSectionView/>},
            {name: 'security', title: 'Security', render: () => <AccountSecuritySectionView/>}
        ]}/>
    </div>
}

export default observer(AccountSettingsView)
