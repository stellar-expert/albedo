import {Operation, TransactionBuilder} from 'stellar-sdk'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 *
 * @param {ClaimableBalance} claimableBalance
 * @param {String} network
 * @return {Promise<Transaction>}
 */
export async function prepareClaimBalanceTx(claimableBalance, network) {
    if (!claimableBalance) return null
    const builder = new TransactionBuilder(accountLedgerData.accountData, {
        networkPassphrase: resolveNetworkParams({network}).network,
        fee: await estimateFee(network)
    }).setTimeout(60)

    const asset = AssetDescriptor.parse(claimableBalance.asset)

    if (!accountLedgerData.hasTrustline(asset)) {
        builder.addOperation(Operation.changeTrust({asset: asset.toAsset()}))
    }

    builder.addOperation(Operation.claimClaimableBalance({
        balanceId: claimableBalance.id
    }))

    return builder.build()
}

export function validateClaimClaimableBalance(claimableBalance) {
    if (accountLedgerData.nonExisting)
        return 'Account doesn\'t exist on the ledger\nYou need to create it first by sending at least 1.6 XLM to the account address.'
    if (!accountLedgerData.getAvailableBalance('XLM', 0.05))
        return 'Not enough funds for the transaction fee'
    if (!accountLedgerData.hasTrustline(AssetDescriptor.parse(claimableBalance.asset)) && !accountLedgerData.getAvailableBalance('XLM', 0.55))
        return 'Not enough funds for the trustline creation'
}