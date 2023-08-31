import React, {useState} from 'react'
import {observer} from 'mobx-react'
import Bignumber from 'bignumber.js'
import {Button} from '@stellar-expert/ui-framework'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import ActionLoaderView from '../shared/action-loader-view'
import AccountBalanceView from './account-balance-view'

function AllAccountBalancesView() {
    let {balancesWithPriority: balances, nonExisting, loaded} = accountLedgerData
    if (nonExisting) {
        balances = {XLM: {asset_type: 'native', balance: 0}}
    }
    const emptyBalances = Object.values(balances)
        .filter(balance => balance.balance.toString() === '0')
    const [hideEmptyBalances, setHideEmptyBalances] = useState(emptyBalances.length)

    if (accountLedgerData.error && !nonExisting)
        return <div className="segment segment-inline error text-small">
            <i className="icon-warning"/> {accountLedgerData.error}
        </div>

    if (!loaded)
        return <ActionLoaderView message="loading"/>

    return <div className="space">
        {Object.values(balances).map(balance => {
            if (!emptyBalances.includes(balance))
                return <AccountBalanceView balance={balance} key={parseAssetFromObject(balance).toFQAN()}/>
        })}
        {!hideEmptyBalances && emptyBalances.map(balance => <AccountBalanceView balance={balance}
                                                                                key={parseAssetFromObject(balance).toFQAN()}/>)}
        {!!hideEmptyBalances && <div className="text-center space">
            <a className="dimmed text-small" onClick={() => setHideEmptyBalances(!setHideEmptyBalances)}>
                Show {emptyBalances.length} more empty balances
            </a>
        </div>}
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