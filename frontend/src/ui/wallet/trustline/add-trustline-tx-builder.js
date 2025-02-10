import {Operation, TransactionBuilder} from '@stellar/stellar-base'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 *
 * @param {String} asset
 * @param {String} network
 * @return {Promise<Transaction>}
 */
export async function prepareAddTrustlineTx(asset, network) {
    if (!asset)
        return null
    const networkParams = resolveNetworkParams({network})
    const fee = await estimateFee(networkParams)
    const builder = new TransactionBuilder(accountLedgerData.accountData, {
        networkPassphrase: networkParams.network,
        fee
    })
        .setTimeout(60)

    builder.addOperation(Operation.changeTrust({asset: AssetDescriptor.parse(asset).toAsset()}))

    return builder.build()
}

export function validateAddTrustline(asset) {
    if (accountLedgerData.nonExisting)
        return 'Account doesn\'t exist on the ledger.\nYou need to create it first by sending at least 1.6 XLM to the account address.'
    if (!accountLedgerData.getAvailableBalance('XLM', 0.05))
        return 'Not enough funds for the transaction fee'
    if (!accountLedgerData.hasTrustline(asset) && !accountLedgerData.getAvailableBalance('XLM', 0.55))
        return 'Not enough funds for the trustline creation'
}