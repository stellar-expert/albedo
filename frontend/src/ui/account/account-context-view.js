import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, useStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../state/account-manager'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'
import AccountDropdownMenuView from '../wallet/dashboard/account-dropdown-menu-view'
import NetworkSelectorView from '../wallet/dashboard/network-selector-view'
import authorizationService from '../../state/auth/authorization'
import AccountNavMenu from './account-nav-menu'
import './account-context.scss'

function AccountContextView({children}) {
    const {activeAccount} = accountManager
    const network = useStellarNetwork()
    if (!activeAccount) {
        navigation.navigate('/intro')
        return null
    }

    useEffect(() => {
        document.addEventListener('visibilitychange', checkAuth)
        const autoCheck = setInterval(checkAuth, 5 * 60 * 1000)
        return () => {
            document.removeEventListener('visibilitychange', checkAuth)
            clearInterval(autoCheck)
        }
    }, [])

    const checkAuth = async () => {
        if (document.visibilityState !== "hidden") {
            const credentials = await authorizationService.getCredentialsFromWebWorker()
            console.log('Active window', credentials)
        }
    }

    useEffect(() => {
        accountLedgerData.init(activeAccount.publicKey, network)
        return function () {
            accountLedgerData.finalize()
        }
    }, [network, activeAccount.publicKey])

    return <div>
        <h2 style={{marginBottom: '0.2em'}}>
            <AccountDropdownMenuView/>
        </h2>
        <div className="dual-layout text-small">
            <a href="/wallet/receive" className="nowrap condensed dimmed">
                <AccountAddress account={activeAccount.publicKey} chars={16} title="Account address" icon={false} link={false}
                                name={false}/>
            </a>
            <div className="text-right"><NetworkSelectorView/></div>
        </div>
        <div className="double-space">
            {children}
        </div>
        <AccountNavMenu/>
    </div>
}

export default observer(AccountContextView)