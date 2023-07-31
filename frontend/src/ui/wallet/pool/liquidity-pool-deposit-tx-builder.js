import {Operation, TransactionBuilder} from 'stellar-sdk'
import Bignumber from 'bignumber.js'
import {getLiquidityPoolAsset} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 *
 * @param {LiquidityPoolDepositSettings} deposit
 * @return {Promise<Transaction>}
 */
export async function prepareLiquidityDepositTx(deposit) {
    if (!deposit.hasSufficientBalance) return null
    const {accountData, address} = accountLedgerData

    const builder = new TransactionBuilder(accountData, {
        networkPassphrase: resolveNetworkParams({network: deposit.network}).network,
        fee: await estimateFee(deposit.network)
    }).setTimeout(60)

    if (!deposit.hasPoolTrustline) {
        builder.addOperation(Operation.changeTrust({asset: getLiquidityPoolAsset(deposit.asset)}))
    }

    let {amount} = deposit
    if (deposit.reverse) {
        amount = amount.slice().reverse()
    }
    const depositPrice = new Bignumber(amount[0] / amount[1])

    const slippageRate = deposit.slippage / 100
    amount = amount.map(a => new Bignumber(a).times(1 - slippageRate).toFixed(7, Bignumber.ROUND_DOWN))

    builder.addOperation(Operation.liquidityPoolDeposit({
        liquidityPoolId: deposit.poolId,
        maxAmountA: amount[0],
        maxAmountB: amount[1],
        minPrice: depositPrice.times(1 - slippageRate),
        maxPrice: depositPrice.times(1 + slippageRate)
    }))

    return builder.build()
}