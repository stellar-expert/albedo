import React from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import ActionLoaderView from '../shared/action-loader-view'
import AccountBalanceView from './account-balance-view'

function AllAccountBalancesView() {
    if (accountLedgerData.error && !accountLedgerData.nonExisting)
        return <div className="text-small error">
            <i className="icon-warning"/> {accountLedgerData.error}
        </div>

    let {balancesWithPriority: balances, nonExisting, loaded} = accountLedgerData
    if (!loaded)
        return <ActionLoaderView message="loading"/>
    if (nonExisting) {
        balances = {XLM: {asset_type: 'native', balance: 0}}
    }
    return <div className="space">
        {Object.values(balances).map(balance => <AccountBalanceView balance={balance} key={parseAssetFromObject(balance).toFQAN()}/>)}
        <div className="row space">
            <div className="column column-50">
                <Button block href="/wallet/add-trustline">Add trustline</Button>
            </div>
            <div className="column column-50">
                <Button block href="/wallet/liquidity-pool/deposit">Deposit pool liquidity</Button>
            </div>
        </div>
        <div className="space"/>
    </div>
}

export default observer(AllAccountBalancesView)