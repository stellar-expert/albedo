import {Operation, TransactionBuilder} from 'stellar-sdk'
import {getLiquidityPoolAsset} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 *
 * @param {LiquidityPoolWithdrawSettings} withdraw
 * @return {Promise<Transaction>}
 */
export async function prepareLiquidityWithdrawTx(withdraw) {
    if (!(withdraw.max > 0) || !(withdraw.amount > 0)) return null
    const builder = new TransactionBuilder(accountLedgerData.accountData, {
        networkPassphrase: resolveNetworkParams({network: withdraw.network}).network,
        fee: await estimateFee(withdraw.network)
    }).setTimeout(60)

    const [minAmountA, minAmountB] = withdraw.getWithdrawalMinAmounts()

    builder.addOperation(Operation.liquidityPoolWithdraw({
        liquidityPoolId: withdraw.poolId,
        amount: withdraw.amount,
        minAmountA,
        minAmountB
    }))

    //remove the pool trustline when the entire stake has been withdrawn
    if (withdraw.max === withdraw.amount) {
        builder.addOperation(Operation.changeTrust({asset: getLiquidityPoolAsset(withdraw.poolAssets), limit: '0'}))
    }
    return builder.build()
}