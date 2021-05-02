import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import DirectKeyInputView from './direct-key-input-view'
import Dropdown from '../components/dropdown'
import AccountAddress from '../components/account-address'
import IdenticonView from '../account/account-identicon-view'
import {CopyToClipboard} from 'react-copy-to-clipboard/lib/Component'

function handleAccountAction(action) {
    switch (action) {
        case 'albedo-account':
            actionContext.directKeyInput = false
            break
            break
        case 'signup':
            __history.push('/signup')
            break
        case 'direct-input':
            actionContext.directKeyInput = true
            break
        default:
            const account = accountManager.get(action)
            if (account) {
                accountManager.setActiveAccount(account)
                actionContext.directKeyInput = false
            }
            break
    }
}

function AuthActionLink({action, children}) {
    return <a href="#" onClick={e => handleAccountAction(action)}>{children}</a>
}

function AuthSelectorView() {
    const {intentParams, directKeyInput, hasNoMatchingKey, requiresExistingAlbedoAccount} = actionContext,
        {pubkey: requestedKey} = intentParams
    let {activeAccount, accounts: allAccounts} = accountManager
    if (requestedKey && hasNoMatchingKey) {
        const matchedAccount = accountManager.get(requestedKey)
        accountManager.setActiveAccount(matchedAccount)
        activeAccount = matchedAccount
    }

    const dropdownOptions = [{
        value: 'title',
        title: directKeyInput ?
            'Direct secret key input' :
            activeAccount ?
                <><IdenticonView address={activeAccount.publicKey}/> {activeAccount.displayName}</> :
                'Albedo account'
    }]

    for (let account of allAccounts) {
        if (!directKeyInput && account === activeAccount) continue
        dropdownOptions.push({
            value: account.id,
            title: <>Switch to&emsp;<IdenticonView address={account.publicKey}/> {account.displayName}</>
        })
    }

    dropdownOptions.push({
        value: ''
    })

    dropdownOptions.push({
        value: 'signup',
        title: allAccounts.length ? 'Add one more account' : 'Create Albedo account'
    })

    if (!directKeyInput && !requiresExistingAlbedoAccount) {
        dropdownOptions.push({
            value: 'direct-input',
            title: 'Provide secret key directly'
        })
    }

    return <div className="space">
        <hr/>
        <span className="dimmed">Account: </span>
        <Dropdown className="dimmed" value="title" onChange={handleAccountAction} options={dropdownOptions}/>
        <div className="space"/>
        {directKeyInput ? <DirectKeyInputView/> : <>
            {hasNoMatchingKey && <div className="space">
                The application requested specific key (<AccountAddress account={requestedKey}/>).
                Either <AuthActionLink action="signup">add another Albedo account</AuthActionLink> or
                provide the requested secret key <AuthActionLink action="direct-input">directly</AuthActionLink>.
            </div>}
            {!activeAccount && <div className="space">
                <a href="/signup">Create new Albedo account</a> to proceed.
            </div>}
            <div className="space"/>
        </>}
    </div>
}

export default observer(AuthSelectorView)