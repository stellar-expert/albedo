import React, {useState} from 'react'
import {Keypair} from 'stellar-sdk'
import {Button} from '@stellar-expert/ui-framework'
import Account, {ACCOUNT_TYPES} from '../../state/account'
import accountManager from '../../state/account-manager'
import Credentials from '../../state/auth/credentials'
import actionContext from '../../state/action-context'
import {saveCredentialsInExtensionStorage} from '../../storage/extension-auth-storage-interface'
import errors from '../../util/errors'
import CredentialsRequest from '../authentication/credentials-request-view'
import HardwareWalletSelectorView from '../authentication/hardware-wallet-selector-view'

export default function SignupSetPasswordStepView({secret, onSuccess}) {
    const [inProgress, setInProgress] = useState(false)

    async function saveAccount(data) {
        setInProgress(true)
        try {
            const {id, password} = data
            let account = id && accountManager.get(id),
                credentials

            if (!account) {
                if (data.type === ACCOUNT_TYPES.STORED_ACCOUNT) {
                    credentials = await Credentials.create({password})
                    if (!secret) {
                        secret = Keypair.random().secret()
                    }
                    account = await Account.createNew(credentials, secret, accountManager.findSuitableFriendlyName())
                    credentials.account = account
                } else {
                    account = await accountManager.loginHWAccount(data)
                }
                accountManager.addAccount(account)
            } else {
                //account already added
                if (account.isStoredAccount) {
                    credentials = await Credentials.create({account, password})
                    //check that the password is valid
                    const secret = await account.requestAccountSecret(credentials)
                    if (!secret) throw errors.invalidPassword
                }
            }
            await accountManager.setActiveAccount(account)
            //save credentials if in extension
            if (account.isStoredAccount) {
                await saveCredentialsInExtensionStorage(credentials)
            }
            //restore default state
            setInProgress(false)
            onSuccess(credentials)
        } catch (e) {
            console.error(e)
            if (!e.status) {
                e = errors.unhandledError()
            }
            setInProgress(false)
            alert(e.message)
        }
    }

    return <>
        <CredentialsRequest confirmText={secret ? 'Import account' : 'Create account'} inProgress={inProgress}
                            requestPasswordConfirmation noRegistrationLink
                            onConfirm={data => saveAccount(data)} onCancel={() => actionContext.cancelAction()}/>
        <div className="space dimmed text-small text-justify">
            We don't have access to your password or secret keys. Everything is encrypted and stored in the browser.
        </div>
        {!secret && <>
            <hr title="already have an account?" className="flare"/>
            <div className="row micro-space">
                <div className="column column-50">
                    <Button block outline href="/login">Log in</Button>
                </div>
                <div className="column column-50">
                    <Button block outline href="/import">Import account</Button>
                </div>
            </div>
            <hr title="or use hardware wallet" className="flare"/>
            <HardwareWalletSelectorView requirePublicKey onConfirm={data => saveAccount(data)}/>
        </>}
    </>
}