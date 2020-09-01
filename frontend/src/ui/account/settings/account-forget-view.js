import React from 'react'
import accountManager from '../../../state/account-manager'
import AccountAddress from '../../components/account-address'
import actionContext from '../../../state/action-context'

export default function AccountForgetView({credentials}) {
    if (!credentials) return null
    const {account} = credentials

    function forgetAccount() {
        let confirmation = `Do you really want to remove account ${account.displayName}?`
        if (account.isStoredAccount) {
            confirmation += '\r\nPlease make sure that you backed up the recovery phrase or transferred all funds from this account.'
        }
        if (confirm(confirmation)) {
            account.forget(credentials)
            accountManager.forget(account)
            if (!actionContext.intent) {
                __history.push('/account')
            } else {
                __history.push('/confirm')
            }
        }
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
                <button className="button button-outline button-block" onClick={forgetAccount}>
                    <i className="fa fa-warning"/> Remove account
                </button>
            </div>
        </div>
        <p className="dimmed text-small">
            Please note, removing the account from Albedo will not affect your Stellar account on the ledger.
            You can use <a href="https://stellar.expert/demolisher/public" target="_blank">StellarExpert Demolisher
            tool</a> to delete Stellar account completely and recover all reserved funds.
        </p>
    </>
}