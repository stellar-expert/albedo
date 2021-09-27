import React, {useState} from 'react'
import CredentialsRequest from './credentials-request-view'
import {Dropdown, navigation} from '@stellar-expert/ui-framework'
import accountManager from '../../state/account-manager'
import {ACCOUNT_TYPES} from '../../state/account'
import Credentials from '../../state/credentials'
import actionContext from '../../state/action-context'
import errors from '../../util/errors'
import HardwareWalletSelectorView from './hardware-wallet-selector-view'

export default function LoginPageView() {
    const allAccounts = accountManager.accounts.filter(a => a.accountType === ACCOUNT_TYPES.STORED_ACCOUNT),
        current = accountManager.activeAccount || allAccounts[0]
    const [inProgress, setInProgress] = useState(false),
        [selectedAccount, setSelectedAccount] = useState(current && current.id)

    async function login(data) {
        setInProgress(true)
        try {
            let account
            if (data.type === ACCOUNT_TYPES.STORED_ACCOUNT) {
                const {password} = data
                account = allAccounts.find(a => a.id === selectedAccount)
                const credentials = await Credentials.create({account, password})

                await account.load(credentials)
            } else {
                account = await accountManager.loginHWAccount(data)
            }
            accountManager.addAccount(account)
            await accountManager.setActiveAccount(account)
            //restore default state
            setInProgress(false)
            //route
            navigation.navigate(actionContext.intent ? '/confirm' : '/account')
        } catch (e) {
            console.error(e)
            if (!e.status) {
                e = errors.unhandledError()
            }
            setInProgress(false)
            alert(e.message)
        }
    }

    const accountSelectorOptions = allAccounts.map(a => ({value: a.id, title: a.displayName}))

    if (!accountSelectorOptions.length) return <>
        <div className="space">
            <h2>Log In</h2>
            No stored accounts available. Looks like you are using Albedo for the first time on this device.
            <div className="row">
                <div className="column column-50 space">
                    <a href="/signup" className="button button-block">Create new account</a>
                    <div className="dimmed text-tiny text-center">
                        Create new empty account and start using Albedo right away.
                    </div>
                </div>
                <div className="column column-50 space">
                    <a href="/import" className="button button-block">Import existing</a>
                    <div className="dimmed text-tiny text-center">
                        Use Albedo paper key or secret key from another Stellar wallet.
                    </div>
                </div>
            </div>
            <hr style={{margin: '3rem 0'}} title="or use hardware wallet" className="flare"/>
            <HardwareWalletSelectorView requirePublicKey onConfirm={login}/>
        </div>
    </>
    return <>
        <h2>Log In</h2>
        <div className="space">
            <Dropdown value={selectedAccount} onChange={value => setSelectedAccount(value)}
                      options={accountSelectorOptions}/>
        </div>
        <CredentialsRequest confirmText="Log in" inProgress={inProgress || accountSelectorOptions.length}
                            onConfirm={login} onCancel={() => navigation.navigate('/')}/>
    </>
}
