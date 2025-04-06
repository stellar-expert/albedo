import {Operation, TransactionBuilder, Claimant} from '@stellar/stellar-base'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'

/**
 *
 * @param {TransferSettings} transfer
 * @return {Promise<Transaction>}
 */
export async function prepareTransferTx(transfer) {
    if (!transfer.hasSufficientBalance)
        return null
    const {accountData} = accountLedgerData
    const networkParams = resolveNetworkParams({network: transfer.network})
    const fee = await estimateFee(networkParams, transfer.fee)
    const builder = new TransactionBuilder(accountData, {networkPassphrase: networkParams.network, fee})
        .setTimeout(60)

    if (transfer.memo) {
        builder.addMemo(transfer.memo)
    }

    switch (transfer.mode) {
        case 'direct':
            preparePaymentOperation(transfer, builder)
            break
        case 'convert':
            prepareTrustline(transfer, builder)
            prepareSwapOperation(transfer, builder)
            break
        case 'claimable':
            prepareClaimableBalanceOperation(transfer, builder)
            break
        default:
            throw new Error(`Unsupported mode: ${transfer.mode}`)
    }

    return builder.build()
}

function prepareSwapOperation(transfer, builder) {
    const shouldCreate = transfer.createDestination && transfer.asset[1] === 'XLM',
        swapProps = {
            source: transfer.source,
            destination: shouldCreate ? transfer.source : transfer.destination,
            sendAsset: AssetDescriptor.parse(transfer.asset[0]).toAsset(),
            destAsset: AssetDescriptor.parse(transfer.asset[1]).toAsset()
        }

    if (transfer.conversionPath) {
        swapProps.path = [...transfer.conversionPath]
    }

    if (transfer.asset[0] !== transfer.asset[1]) {
        if (transfer.conversionDirection === 'source') {
            builder.addOperation(Operation.pathPaymentStrictSend({
                ...swapProps,
                sendAmount: transfer.amount[0],
                destMin: transfer.amount[1]
            }))
        } else {
            builder.addOperation(Operation.pathPaymentStrictReceive({
                ...swapProps,
                sendMax: transfer.amount[0],
                destAmount: transfer.amount[1]
            }))
        }
    }

    if (shouldCreate) {
        builder.addOperation(Operation.createAccount({
            source: transfer.source,
            destination: transfer.destination,
            startingBalance: transfer.amount[1]
        }))
    }
}

function preparePaymentOperation(transfer, builder) {
    if (transfer.createDestination && transfer.asset[0] === 'XLM') {
        builder.addOperation(Operation.createAccount({
            source: transfer.source,
            startingBalance: transfer.amount[0],
            destination: transfer.destination
        }))
    } else {
        builder.addOperation(Operation.payment({
            source: transfer.source,
            destination: transfer.destination,
            asset: AssetDescriptor.parse(transfer.asset[0]).toAsset(),
            amount: transfer.amount[0]
        }))
    }
}

function prepareClaimableBalanceOperation(transfer, builder) {
    const claimants = [new Claimant(transfer.destination, Claimant.predicateUnconditional())]
    if (transfer.destination !== transfer.source) {
        claimants.push(new Claimant(transfer.source, Claimant.predicateUnconditional()))
    }
    builder.addOperation(Operation.createClaimableBalance({
        source: transfer.source,
        asset: AssetDescriptor.parse(transfer.asset[0]).toAsset(),
        amount: transfer.amount[0],
        claimants
    }))
}

function prepareTrustline(transfer, builder) {
    if (transfer.createTrustline) {
        builder.addOperation(Operation.changeTrust({asset: AssetDescriptor.parse(transfer.asset[1]).toAsset()}))
    }
}