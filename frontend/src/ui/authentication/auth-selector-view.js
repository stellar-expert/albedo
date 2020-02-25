import React from 'react'
import {transaction} from 'mobx'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import InputKeySelectorView from './input-key-selector-view'
import KeyPairSelectorView from './keypair-selector-view'
import Dropdown from '../components/dropdown'
import AccountAddress from '../components/account-address'

function handleAccountAction(action) {
    switch (action) {
        case 'albedo-account':
            accountManager.directKeyInput = false
            break
        case 'login':
            __history.push('/login')
            break
        case 'signup':
            __history.push('/signup')
            break
        case 'add-keypair':
            __history.push('/account/add-keypair')
            break
        case 'direct-input':
            accountManager.directKeyInput = true
            break
        default:
            const account = accountManager.accounts.find(a => a.id === action)
            if (account) {
                accountManager.setActiveAccount(account)
                accountManager.directKeyInput = false
            }
            break
    }
}

function AuthActionLink({action, children}) {
    return <a href="#" onClick={e => handleAccountAction(action)}>{children}</a>
}

function AuthSelectorView() {
    const {activeAccount, directKeyInput, accounts: allAccounts} = accountManager,
        {txContext, intentParams} = actionContext,
        {pubkey: requestedKey} = intentParams,
        noMatchingKey = requestedKey && activeAccount && !activeAccount.keypairs.some(keyPair => keyPair.publicKey === requestedKey),
        sendPartiallySigned = txContext && txContext.signatures.length > 0 && !txContext.isFullySigned

    const dropdownOptions = [{
        value: 'title',
        title: directKeyInput ? 'Direct secret key input' : `Albedo account ${activeAccount ? activeAccount.displayName : ''}`
    }]

    for (let account of allAccounts) {
        if (!directKeyInput && account === activeAccount) continue
        dropdownOptions.push({
            value: account.id,
            title: `Switch to ${account.displayName}`
        })
    }

    dropdownOptions.push({
        value: ''
    })

    if (activeAccount) {
        dropdownOptions.push({
            value: 'add-keypair',
            title: 'Add new signing key'
        })
    }

    dropdownOptions.push({
        value: 'login',
        title: 'Log in to another Albedo account'
    })
    dropdownOptions.push({
        value: 'signup',
        title: 'Create new Albedo account'
    })

    if (!directKeyInput) {
        dropdownOptions.push({
            value: 'direct-input',
            title: 'Provide secret key directly'
        })
    }

    return <div className="space">
        <hr/>
        Using <Dropdown className="dimmed" value="title" onChange={handleAccountAction} options={dropdownOptions}/>
        {directKeyInput ? <InputKeySelectorView/> : <>
            {!!activeAccount && <div className="dimmed text-small">Choose a key you'd like to use:</div>}
            {noMatchingKey && <div className="space">
                The application requested specific key (<AccountAddress account={requestedKey}/>), but current account
                does not contain the corresponding key pair.
                Either <AuthActionLink action="login">switch</AuthActionLink> to another Albedo
                account, <AuthActionLink action="add-keypair">add new signing key</AuthActionLink> to current account,
                or provide the requested secret key <AuthActionLink action="direct-input">directly</AuthActionLink>.
            </div>}
            {activeAccount ?
                <KeyPairSelectorView/> :
                <div className="space">
                    <a href="/signup">Sign up</a> or <a href="/login">log in</a>{' '}
                    into your Albedo account to proceed.
                </div>}
        </>}

        <hr/>
        <div>
            {sendPartiallySigned &&
            <button className="button button-outline" onClick={() => actionContext.finalize()}>
                Return partially signed transaction
            </button>}
            <button className="button button-outline" onClick={() => actionContext.rejectRequest()}>
                Cancel
            </button>
        </div>
    </div>
}

export default observer(AuthSelectorView)