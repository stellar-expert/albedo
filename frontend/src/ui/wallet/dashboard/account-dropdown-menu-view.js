import React, {useState} from 'react'
import {Dropdown, AccountIdenticon, formatExplorerLink, useTheme} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../../state/account-manager'

export default function AccountDropdownMenuView() {
    const [current, setCurrentAccount] = useState(() => accountManager.activeAccount)
    const [theme, setTheme] = useTheme()

    function handleAction(action) {
        switch (action) {
            case 'settings':
                navigation.navigate('/account-settings')
                break
            case 'explorer':
                window.open(formatExplorerLink('account', current.publicKey))
                break
            case 'login':
                navigation.navigate('/login')
                break
            case 'signup':
                navigation.navigate('/signup')
                break
            case 'walletconnect':
                navigation.navigate('/wallet-connect/connect')
                break
            case 'theme':
                setTheme(current => current === 'day' ? 'night' : 'day')
                break
            default:
                const account = accountManager.get(action)
                if (account) {
                    accountManager.setActiveAccount(account)
                    setCurrentAccount(account)
                }
                break
        }
    }

    const {accounts: allAccounts} = accountManager
    if (!current) {
        navigation.navigate('/login')
        return null
    }
    const dropdownOptions = [{
        value: 'title',
        title: <><AccountIdenticon address={current.publicKey}/>{current.shortDisplayName}</>
    }]

    dropdownOptions.push({
        value: 'settings',
        title: <>Manage settings for this account</>
    })

    dropdownOptions.push({
        value: 'explorer',
        title: <>View details on StellarExpert</>
    })

    dropdownOptions.push({
        value: 'walletconnect',
        title: <>Link via WalletConnect</>
    })

    if (allAccounts.length > 1) {
        dropdownOptions.push('-')
    }

    for (let account of allAccounts)
        if (account !== current) {
            dropdownOptions.push({
                value: account.id,
                title: <>Switch to&nbsp;<AccountIdenticon address={account.publicKey}/> {account.displayName}</>
            })
        }

    dropdownOptions.push({
        value: 'signup',
        title: <>Create/import new account</>
    })

    dropdownOptions.push('-')

    dropdownOptions.push({
        value: 'theme',
        title: theme === 'day' ?
            <><i className="icon icon-night"/> Switch to dark theme</> :
            <><i className="icon icon-day"/> Switch to light theme</>
    })

    dropdownOptions.push({
        value: 'about',
        title: <div className="dimmed dual-layout">
            <div>
                {new Date().getFullYear()}&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
            </div>
            <div>&emsp;
                <a href="mailto:info@stellar.expert" target="_blank" title="Contact us"><i className="icon-email"/></a>&emsp;
                <a href="https://github.com/stellar-expert/albedo" target="_blank" title="Source code"><i className="icon-github"/></a>
            </div>
        </div>
    })

    return <Dropdown value="title" onChange={handleAction} options={dropdownOptions} hideSelected/>
}