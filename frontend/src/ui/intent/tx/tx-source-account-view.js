import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import {zeroAccount} from '../../../util/tx-replace-utils'

/**
 * @param {Transaction} tx
 * @param {Account} selectedAccount
 */
export default function TxSourceAccountView({tx, selectedAccount}) {
    if (tx.source === zeroAccount) {
        if (selectedAccount) return <>{selectedAccount.displayName}</>
        return <>unspecified</>
    }
    const txSourceAccount = accountManager.get(tx.source)
    if (txSourceAccount) return <>
        {txSourceAccount.friendlyName} (<AccountAddress account={tx.source} chars={12}/>)
    </>
    return <AccountAddress account={tx.source} chars={12}/>
}