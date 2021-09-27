import {Operation, TransactionBuilder, Claimant} from 'stellar-sdk'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'
import {wrapAsset} from '../../../util/wrap-asset'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

/**
 *
 * @param {TransferSettings} transfer
 * @return {Promise<Transaction>}
 */
export async function prepareTransferTx(transfer) {
    if (!transfer.hasSufficientBalance) return null
    const {accountData, address} = accountLedgerData

    const builder = new TransactionBuilder(accountData, {
        networkPassphrase: resolveNetworkParams({network: transfer.network}).network,
        fee: await estimateFee(transfer.network)
    }).setTimeout(60)

    if (transfer.memo) {
        builder.addMemo(transfer.memo)
    }

    switch (transfer.mode) {
        case 'direct':
            preparePaymentOperation(transfer, builder)
            break
        case 'convert':
            if (prepareTrustline(transfer, builder) === false) return null
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
    const shouldCreate = transfer.createDestination && transfer.destAsset === 'XLM',
        swapProps = {
            source: transfer.source,
            destination: shouldCreate ? transfer.source : transfer.destination,
            sendAsset: wrapAsset(transfer.sourceAsset),
            destAsset: wrapAsset(transfer.destAsset)
        }

    if (transfer.conversionPath) {
        swapProps.path = [...transfer.conversionPath]
    }

    if (transfer.sourceAsset !== transfer.destAsset) {
        if (transfer.conversionDirection === 'source') {
            builder.addOperation(Operation.pathPaymentStrictSend({
                ...swapProps,
                sendAmount: transfer.sourceAmount,
                destMin: transfer.destAmount
            }))
        } else {
            builder.addOperation(Operation.pathPaymentStrictReceive({
                ...swapProps,
                sendMax: transfer.sourceAmount,
                destAmount: transfer.destAmount
            }))
        }
    }

    if (shouldCreate) {
        builder.addOperation(Operation.createAccount({
            source: transfer.source,
            destination: transfer.destination,
            startingBalance: transfer.destAmount
        }))
    }
}

function preparePaymentOperation(transfer, builder) {
    if (transfer.createDestination && transfer.sourceAsset === 'XLM') {
        builder.addOperation(Operation.createAccount({
            source: transfer.source,
            startingBalance: transfer.sourceAmount,
            destination: transfer.destination
        }))
    } else {
        builder.addOperation(Operation.payment({
            source: transfer.source,
            destination: transfer.destination,
            asset: wrapAsset(transfer.sourceAsset),
            amount: transfer.sourceAmount
        }))
    }
}

function prepareClaimableBalanceOperation(transfer, builder) {
    builder.addOperation(Operation.createClaimableBalance({
        source: transfer.source,
        asset: wrapAsset(transfer.sourceAsset),
        amount: transfer.sourceAmount,
        claimants: [new Claimant(transfer.destination, Claimant.predicateUnconditional()),
            new Claimant(transfer.source, Claimant.predicateUnconditional())]
    }))
}

function prepareTrustline(transfer, builder) {
    if (transfer.createTrustline) {
        builder.addOperation(Operation.changeTrust({asset: wrapAsset(transfer.destAsset)}))
    }
}