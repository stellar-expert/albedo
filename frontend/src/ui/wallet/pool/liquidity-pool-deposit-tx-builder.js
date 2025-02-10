import {Operation, TransactionBuilder} from '@stellar/stellar-base'
import {getLiquidityPoolAsset} from '@stellar-expert/asset-descriptor'
import {fromStroops, stripTrailingZeros} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'
import {withSlippage} from '../../../util/slippage'

/**
 *
 * @param {LiquidityPoolDepositSettings} deposit
 * @return {Promise<Transaction>}
 */
export async function prepareLiquidityDepositTx(deposit) {
    if (!deposit.hasSufficientBalance)
        return null
    const {accountData, address} = accountLedgerData

    const builder = new TransactionBuilder(accountData, {
        networkPassphrase: resolveNetworkParams({network: deposit.network}).network,
        fee: await estimateFee(deposit.network, deposit.fee)
    }).setTimeout(60)

    if (!deposit.hasPoolTrustline) {
        builder.addOperation(Operation.changeTrust({asset: getLiquidityPoolAsset(deposit.asset)}))
    }

    let {amount} = deposit
    if (deposit.reverse) {
        amount = amount.slice().reverse()
    }
    const depositPrice = amount[0] / amount[1]

    const slippageRate = deposit.slippage / 100
    if (deposit.poolInfo?.parameters) {
        amount = amount.map(a => fromStroops(withSlippage(a, -deposit.slippage)))
    }

    builder.addOperation(Operation.liquidityPoolDeposit({
        liquidityPoolId: deposit.poolId,
        maxAmountA: amount[0],
        maxAmountB: amount[1],
        minPrice: stripTrailingZeros((depositPrice * (1 - slippageRate)).toFixed(7)),
        maxPrice: stripTrailingZeros((depositPrice * (1 + slippageRate)).toFixed(7))
    }))

    return builder.build()
}