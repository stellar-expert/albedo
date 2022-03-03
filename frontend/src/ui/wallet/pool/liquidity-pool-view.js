import React from 'react'
import {observer} from 'mobx-react'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import AccountBalanceView from '../balance/account-balance-view'

function LiquidityPoolView() {
    if (!accountLedgerData) return <div className="loader"/>
    const {balances, error, nonExisting} = accountLedgerData,
        shares = Object.values(balances).filter(b => b.asset_type === 'liquidity_pool_shares')

    return <div className="space">
        <h3>Liquidity staking</h3>
        <hr className="flare"/>
        <div>
            {shares.map(balance => {
                const asset = parseAssetFromObject(balance)
                return <AccountBalanceView balance={balance} key={asset.toFQAN()}>
                    {balance.balance > 0 && <div className="text-right">
                        <a href={'/wallet/liquidity-pool/withdraw?pool=' + asset.toString()} className="button button-outline small">
                            Withdraw liquidity</a>
                    </div>}
                </AccountBalanceView>
            })}
            {nonExisting && <div className="dimmed text-tiny space text-center">
                (Liquidity pool stakes unavailable – account doesn't exist on the ledger)
            </div>}
            {!!error && !nonExisting && <div className="text-small error">
                <i className="icon-warning"/> {error}
            </div>}
            {!error && !nonExisting && !shares.length && <div className="dimmed text-tiny space text-center">
                (No liquidity pool stakes so far)
            </div>}
        </div>
        <div className="space">
            <a className="button button-block" href="/wallet/liquidity-pool/deposit">Deposit liquidity to the pool</a>
        </div>
    </div>
}

export default observer(LiquidityPoolView)