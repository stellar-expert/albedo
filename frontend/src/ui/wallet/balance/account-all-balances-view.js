import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import ActionLoaderView from '../shared/action-loader-view'
import AccountBalanceView from './account-balance-view'
import Bignumber from 'bignumber.js'

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
    const emptyBalances = Object.values(balances).filter(balance => (new Bignumber(balance.balance).toString() === new Bignumber(0).toString()))
    const [hideEmptyBalances, setHideEmptyBalances] = useState(emptyBalances.length)

    return <div className="space">
        {Object.values(balances).map(balance => {
          if (!emptyBalances.includes(balance)) return <AccountBalanceView balance={balance} key={parseAssetFromObject(balance).toFQAN()}/>
        })}
        {!hideEmptyBalances && emptyBalances.map(balance => <AccountBalanceView balance={balance} key={parseAssetFromObject(balance).toFQAN()}/>)}
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