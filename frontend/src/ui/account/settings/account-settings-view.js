import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, Button, CopyToClipboard, navigation} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import authorizationService from '../../../state/authorization'
import AccountFriendlyNameView from './account-friendly-name-view'
import AccountForgetView from './account-forget-view'
import SecretView from './secret-view'

function AccountSettingsView() {
    const {activeAccount} = accountManager
    if (!activeAccount) window.location.href = '/'
    //account credentials
    const [credentials, setCredentials] = useState(() => {
        authorizationService.requestAuthorization(activeAccount)
            .then(credentials => {
                setCredentials(credentials)
            })
            .catch(err => {
                if (err && err.code === -4) { //rejected by user
                    finish()
                } else {
                    console.error(err)
                }
            })
    })

    const [secret, setSecret] = useState('')

    useEffect(() => {
        if (credentials && !secret) {
            setSecret(credentials.account.requestAccountSecret(credentials))
        }
    }, [credentials])

    function finish() {
        if (!actionContext.intent) {
            navigation.navigate('/account')
        } else {
            navigation.navigate('/confirm')
        }
    }

    if (!credentials) return <div className="text-center dimmed">
        <div className="loader"/>
        Waiting for authorization
    </div>

    return <div onKeyDown={e => e.keyCode === 27 && finish()}>
        <h2>Account settings</h2>
        <div>
            Public key:{' '}
            <span>
                <AccountAddress account={activeAccount.publicKey}/>
                <CopyToClipboard text={activeAccount.publicKey} title="Copy public key to clipboard"/>
            </span>
            <p className="text-small dimmed">
                Identifies the account on the ledger. Think of it as an address which holds your balances
                and where other users can send funds.
            </p>
        </div>
        <AccountFriendlyNameView credentials={credentials}/>
        <hr className="flare"/>
        <div className="space">
            <h3>Export secret key</h3>
            <div className="text-small dimmed">
                <p>
                    The secret key is used internally to sign Stellar transactions and authenticate account identity on
                    third-party services. Corresponding 24-word recovery passphrase is the backup of your secret key.
                </p>
                <p>
                    <i className="icon-warning"/> Do not share your secret key or passphrase.
                    Do not trust any person or website asking it.
                    Avoid storing it in unsafe places, your phone, or computer in the plaintext.
                    Anyone with this key will have access to funds stored on your account.
                </p>
            </div>
            <div className="space">
                <SecretView encodeMnemonic secret={secret} placeholder="(click here to reveal passphrase)">
                    Account passphrase</SecretView>
            </div>
            <div className="micro-space">
                <SecretView secret={secret} placeholder="(click here to reveal secret key)">
                    Secret key</SecretView>
            </div>
        </div>
        <AccountForgetView credentials={credentials}/>
        <hr className="double-space flare"/>
        <div className="space row">
            <div className="column column-50 column-offset-25">
                <Button block outline onClick={finish}>Back</Button>
            </div>
        </div>
    </div>
}

export default observer(AccountSettingsView)
