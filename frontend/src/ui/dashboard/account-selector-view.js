import React, {useState} from 'react'
import accountManager from '../../state/account-manager'
import Dropdown from '../components/dropdown'
import IdenticonView from '../account/account-identicon-view'
import {useStellarNetwork} from '../../state/network-selector'
import {formatExplorerLink} from '../components/explorer-link'

export default function AccountSelectorView() {
    const currentNetwork = useStellarNetwork()
    const [current, setCurrentAccount] = useState(() => accountManager.activeAccount)

    function handleAccountAction(action) {
        switch (action) {
            case 'settings':
                __history.push('/account-settings')
                break
            case 'explorer':
                window.open(formatExplorerLink(currentNetwork, 'account', current.publicKey))
                break
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
                    setCurrentAccount(account)
                }
                break
        }
    }

    const {accounts: allAccounts} = accountManager
    if (!current) {
        __history.push('/login')
        return null
    }
    const dropdownOptions = [{
        value: 'title',
        title: <><IdenticonView address={current.publicKey} large/> {current.shortDisplayName}</>
    }]

    dropdownOptions.push({
        value: 'settings',
        title: <>Manage settings for this account</>
    })

    dropdownOptions.push({
        value: 'explorer',
        title: <>View details on StellarExpert</>
    })

    if (dropdownOptions.length > 1) {
        dropdownOptions.push({
            value: ''
        })
    }

    for (let account of allAccounts)
        if (account !== current) {
            dropdownOptions.push({
                value: account.id,
                title: <>Switch to&nbsp;<IdenticonView address={account.publicKey}/> {account.displayName}</>
            })
        }

    dropdownOptions.push({
        value: 'signup',
        title: <>Create/import new account</>
    })

    return <Dropdown className="dimmed" value="title" onChange={handleAccountAction} options={dropdownOptions}
                     hideSelected/>
}