import React from 'react'
import {observer} from 'mobx-react'
import {Button, parseAssetFromObject} from '@stellar-expert/ui-framework'
import AccountBalanceView from './account-balance-view'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

function AllAccountBalancesView() {
    if (accountLedgerData.error && !accountLedgerData.nonExisting) return <div className="text-small error">
        <i className="icon-warning"/> {accountLedgerData.error}
    </div>

    let {address, balancesWithPriority: balances, nonExisting} = accountLedgerData
    if (nonExisting) {
        balances = {XLM: {asset_type: 'native', balance: 0}}
    }

    return <div>
        {Object.values(balances).map(balance => <AccountBalanceView balance={balance} key={parseAssetFromObject(balance).toFQAN()}/>)}
        <div className="text-right">
            <Button href="/wallet/add-trustline">Add trustline</Button>
        </div>
    </div>
}

export default observer(AllAccountBalancesView)