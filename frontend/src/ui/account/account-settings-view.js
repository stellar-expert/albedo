import React, {useState} from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import AccountAddress from '../components/account-address'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import authorizationService from '../../state/authorization'
import {secretToMnemonic} from '../../util/mnemonic'

function AccountSecretKeyView({credentials}) {
    if (!credentials) return null
    //secret key
    const [secret, setSecret] = useState('')

    function revealSecret() {
        const plainSecret = credentials.account.requestAccountSecret(credentials)
        setSecret(plainSecret)
    }

    return <>
        <div className="dual-layout">
            <div>Secret key</div>
            <div>
                {!secret ?
                    <a href="#" onClick={revealSecret}>Reveal</a> :
                    <a href="#" onClick={() => setSecret('')}>Hide</a>}
            </div>
        </div>
        <div>
             <textarea readOnly value={secret} style={{height: '2.5em', color: '#f10000'}}
                       placeholder={'(hidden, click "Reveal" to show it)'} onFocus={e => e.target.select()}/>
        </div>
    </>
}


function AccountPassphraseView({credentials}) {
    if (!credentials) return null
    //secret key
    const [secret, setSecret] = useState('')

    function revealSecret() {
        const plainSecret = credentials.account.requestAccountSecret(credentials)
        setSecret(plainSecret)
    }

    return <>
        <div className="dual-layout">
            <div>Account passphrase</div>
            <div>
                {!secret ?
                    <a href="#" onClick={revealSecret}>Reveal</a> :
                    <a href="#" onClick={() => setSecret('')}>Hide</a>}
            </div>
        </div>
        <div>
             <textarea readOnly style={{height: '5.2em', color: '#F10000'}}
                       value={secret ? secretToMnemonic(secret) : ''} onFocus={e => e.target.select()}
                       placeholder={'(hidden, click "Reveal" to show it)'}/>
        </div>
    </>
}

function AccountSettingsView() {
    const {activeAccount} = accountManager
    //account friendly name
    const [friendlyName, setFriendlyName] = useState(activeAccount.friendlyName)
    //account credentials
    const [credentials, setCredentials] = useState(() => {
        authorizationService.requestAuthorization(activeAccount)
            .then(credentials => {
                setCredentials(credentials)
            })
            .catch(err => {
                console.error(e)
            })
    })

    function saveFriendlyName() {
        if (activeAccount.friendlyName !== friendlyName) {
            activeAccount.friendlyName = friendlyName
            activeAccount.save(credentials)
        }
    }

    function finish() {
        if (!actionContext.intent) {
            __history.push('/account')
        } else {
            __history.push('/confirm')
        }
    }

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
        <div className="space">
            <label>Friendly name
                <input name="friendly-name" placeholder="i.e. 'Primary Account' or 'Reserve Funds'" maxLength={15}
                       value={friendlyName} onChange={e => setFriendlyName(e.target.value.substr(0, 15))}
                       onKeyDown={e => e.keyCode === 13 && saveFriendlyName()} onBlur={() => saveFriendlyName()}/>
            </label>
            <div className="text-small dimmed">
                Setting friendly name makes it easier to identify an account when you are using more than one.
            </div>
        </div>
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
        <hr className="space"/>
        <div className="space row">
            <div className="column column-50 column-offset-25">
                <button className="button button-block button-outline" onClick={finish}>Back</button>
            </div>
        </div>
    </div>
}

export default observer(AccountSettingsView)
