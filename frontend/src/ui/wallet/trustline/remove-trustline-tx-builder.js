import {Operation, TransactionBuilder} from 'stellar-sdk'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 * @param {String} asset
 * @param {String|Boolean} convertAsset
 * @param {String} path
 * @param {String} network
 * @return {Promise<Transaction>}
 */
export async function prepareRemoveTrustlineTx({asset, convertAsset, path, network}) {
    if (!asset || asset === 'XLM')
        return null
    const builder = new TransactionBuilder(accountLedgerData.accountData, {
        networkPassphrase: resolveNetworkParams({network}).network,
        fee: await estimateFee(network)
    }).setTimeout(60)
    const {balance} = accountLedgerData.balances[asset]
    asset = AssetDescriptor.parse(asset)
    if (parseFloat(balance) > 0) {
        if (convertAsset) {
            builder.addOperation(Operation.pathPaymentStrictSend({
                destination: accountLedgerData.address,
                sendAsset: asset.toAsset(),
                sendAmount: balance,
                destAsset: AssetDescriptor.parse(convertAsset).toAsset(),
                destMin: '0.0000001'
            }))
        } else {
            builder.addOperation(Operation.payment({
                destination: asset.issuer,
                amount: balance,
                asset: asset.toAsset()
            }))
        }
    }
    builder.addOperation(Operation.changeTrust({
        asset: asset.toAsset(),
        limit: '0'
    }))

    return builder.build()
}

export function validateRemoveTrustline(asset) {
    if (accountLedgerData.nonExisting)
        return 'Account doesn\'t exist on the ledger.\nYou need to create it first by sending at least 1.6 XLM to the account address.'
    const balance = accountLedgerData.balances[asset]
    if (!accountLedgerData.getAvailableBalance('XLM', 0.05))
        return 'Not enough funds for the transaction fee'
    if (!accountLedgerData.hasTrustline(asset))
        return 'Trustline doesn\'t exist'
    if (balance.buying_liabilities > 0 || balance.selling_liabilities > 0 || parseFloat(accountLedgerData.getAvailableBalance(asset)) < parseFloat(balance.balance))
        return 'There are locked funds on this trustline. Remove DEX offers before removing the trustline.'
}