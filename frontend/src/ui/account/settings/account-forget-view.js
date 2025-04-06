import React from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'

export default function AccountForgetView({credentials}) {
    if (!credentials) return null
    const {account} = credentials

    async function forgetAccount() {
        let confirmation = `Do you really want to remove account ${account.displayName}?`
        if (account.isStoredAccount) {
            confirmation += '\r\nPlease make sure that you backed up the recovery phrase or transferred all funds from this account.'
        }
        await confirm(confirmation, {
            title: 'Remove account',
            icon: 'warning-circle'
        })
        account.verifyCredentials(credentials)
        await accountManager.forget(account)
        navigation.navigate(actionContext.intent ? '/confirm' : '/account')
    }

    return <>
        <h3>Forget account</h3>
        <p className="dimmed text-small">
            If you want to remove account {account.displayName} from Albedo, please make sure
            that you have the backup of your recovery phrase or secret key somewhere because you will no longer have
            access to this account from Albedo on your current device once you delete it.
        </p>
        <div className="row">
            <div className="column column-50 column-offset-25">
                <Button block outline onClick={forgetAccount}><i className="icon-warning"/> Remove account</Button>
            </div>
        </div>
        <p className="dimmed text-small micro-space">
            Please note, removing the account from Albedo will not affect your Stellar account on the ledger.
            You can use <a href="https://stellar.expert/demolisher/public" target="_blank">StellarExpert Demolisher
            tool</a> to delete Stellar account completely and reclaim all reserved funds.
        </p>
    </>
}