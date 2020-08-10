import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import authorizationService from '../../../state/authorization'
import AccountAddress from '../../components/account-address'
import AccountPassphraseView from './account-passphrase-view'
import AccountSecretKeyView from './account-secret-key-view'
import AccountFriendlyNameView from './account-friendly-name-view'
import AccountForgetView from './account-forget-view'

function AccountSettingsView() {
    const {activeAccount} = accountManager
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

    function finish() {
        if (!actionContext.intent) {
            __history.push('/account')
        } else {
            __history.push('/confirm')
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
                <CopyToClipboard text={activeAccount.publicKey}>
                    <a href="#" className="fa fa-copy active-icon" title="Copy public key to clipboard"/>
                </CopyToClipboard>
            </span>
            <p className="text-small dimmed">
                Identifies the account on the ledger. Think of it as an address which holds your balances
                and where other users can send funds.
            </p>
        </div>
        <AccountFriendlyNameView credentials={credentials}/>
        <hr/>
        <div className="space">
            <h3>Export secret key</h3>
            <div className="text-small dimmed">
                <p>
                    The secret key is used internally to sign Stellar transactions and authenticate account identity on
                    third-party services. Corresponding 24-word recovery passpharase is the backup of your secret key.
                </p>
                <p>
                    <i className="fa fa-warning"/> Do not share your secret key or passpharase.
                    Do not trust any person or website asking it.
                    Avoid storing it in unsafe places, your phone, or computer in the plaintext.
                    Anyone with this key will have access to funds stored on your account.
                </p>
            </div>
            <div className="space">
                <AccountPassphraseView credentials={credentials}/>
                <AccountSecretKeyView credentials={credentials}/>
            </div>
        </div>
        <div className="space">
            <AccountForgetView credentials={credentials}/>
        </div>
        <hr className="space"/>
        <div className="space row">
            <div className="column column-50 column-offset-25">
                <button className="button button-block button-outline" onClick={finish}>Back</button>
            </div>
        </div>
    </div>
}

export default observer(AccountSettingsView)
