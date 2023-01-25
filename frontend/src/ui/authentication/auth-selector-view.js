import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from 'stellar-sdk'
import {AccountAddress, Dropdown, AccountIdenticon, useAutoFocusRef} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import Account from '../../state/account'

function AuthSelectorView() {
    const {intentParams, requestedPubkey, selectedAccount} = actionContext,
        requiresExistingAlbedoAccount = actionContext.intentRequests.some(ir => ir.requiresExistingAlbedoAccount),
        [directKeyInput, setDirectKeyInput] = useState(false),
        [directKeyInputSecret, setDirectKeyInputSecret] = useState('')
    useEffect(() => {
        if (directKeyInput && StrKey.isValidEd25519SecretSeed(directKeyInputSecret)) {
            actionContext.selectAccount(Account.ephemeral(directKeyInputSecret))
        }
    }, [directKeyInput])

    if (!intentParams) return null

    let {accounts: allAccounts} = accountManager

    function setSecret(secret) {
        secret = secret.replace(/[^a-zA-Z\d]/g, '')
        setDirectKeyInputSecret(secret)
        if (StrKey.isValidEd25519SecretSeed(secret)) {
            actionContext.selectAccount(Account.ephemeral(secret))
        } else {
            actionContext.selectAccount(null)
        }
    }

    function handleAccountAction(value) {
        switch (value) {
            case 'signup':
                setDirectKeyInput(false)
                navigation.navigate('/signup')
                break
            case 'direct-input':
                setDirectKeyInput(true)
                actionContext.selectAccount(null)
                break
            default:
                setDirectKeyInput(false)
                actionContext.selectAccount(accountManager.get(value))
                break
        }
    }

    function AuthActionLink({action, children}) {
        return <a href="#" onClick={e => handleAccountAction(action)}>{children}</a>
    }

    const dropdownOptions = [{
        value: 'title',
        title: directKeyInput ?
            'Direct secret key input' :
            selectedAccount ?
                <><AccountIdenticon address={selectedAccount.publicKey}/> {selectedAccount.displayName}</> :
                <>Choose account</>
    }]

    for (let account of allAccounts) {
        if (!directKeyInput && account === selectedAccount) continue
        dropdownOptions.push({
            value: account.id,
            title: <>Switch to&nbsp;<AccountIdenticon address={account.publicKey}/> {account.displayName}</>,
            disabled: !!requestedPubkey && account.publicKey !== requestedPubkey
        })
    }

    dropdownOptions.push('-')

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
        <hr className="flare"/>
        <span className="dimmed">Execute using </span>
        <Dropdown value="title" onChange={handleAccountAction} options={dropdownOptions} solo
                  header={<h3 style={{margin: 0}}>Choose account</h3>}/>
        <div className="space"/>
        {directKeyInput ? <>
            <div className="dimmed text-small">Provide a secret key you'd like to use:</div>
            <div className="micro-space">
                <input type="text" ref={useAutoFocusRef} placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"
                       value={directKeyInputSecret} onChange={e => setSecret(e.target.value)} className="key"/>
            </div>
        </> : <>
            {!!requestedPubkey && !selectedAccount && <div className="space">
                The application requested specific key (<AccountAddress account={requestedPubkey}/>).
                Either <AuthActionLink action="signup">add another Albedo account</AuthActionLink> or
                provide the requested secret key <AuthActionLink action="direct-input">directly</AuthActionLink>.
            </div>}
            {!selectedAccount && <div className="space">
                <AuthActionLink action="signup">Create new Albedo account</AuthActionLink> to proceed.
            </div>}
            <div className="space"/>
        </>}
    </div>
}

export default observer(AuthSelectorView)