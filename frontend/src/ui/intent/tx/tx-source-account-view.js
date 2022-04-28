import {AccountAddress} from '@stellar-expert/ui-framework'
import React from 'react'
import {zeroAccount} from '../../../util/tx-replace-utils'
import accountManager from '../../../state/account-manager'

export default function TxSourceAccountView({tx, selectedAccount}) {
    if (tx.source === zeroAccount) {
        if (selectedAccount) return <>{selectedAccount.displayName}</>
        return <>unspecified</>
    }
    const requestedAccount = accountManager.get(tx.source)
    if (requestedAccount)  return <>
        {requestedAccount.friendlyName} (<AccountAddress account={tx.source} chars={12}/>)
    </>
    return <AccountAddress account={tx.source} chars={12}/>
}