import {Operation, TransactionBuilder, Claimant, Address, XdrLargeInt, Contract, StrKey, Memo} from '@stellar/stellar-base'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolveNetworkParams} from '../../../util/network-resolver'
import {estimateFee} from '../../../util/fee-estimator'
import {getSacContractAddress, simulateTx} from '../../../util/sac-contract'

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

    const opBuilderCallback = transferBuilders[transfer.mode]
    if (!opBuilderCallback)
        throw new Error(`Unsupported mode: ${transfer.mode}`)
    let res = opBuilderCallback(transfer, builder)
    if (res instanceof Promise) {
        res = await res
    }
    return res
}

const transferBuilders = {
    direct: preparePaymentOperation,
    convert: prepareSwapOperation,
    claimable: prepareClaimableBalanceOperation
}

function prepareSwapOperation(transfer, builder) {
    prepareTrustline(transfer, builder) //?
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
    return builder.build()
}

function preparePaymentOperation(transfer, builder) {
    const asset = transfer.asset[0]
    const {destination} = transfer
    //SAC token transfer
    if (typeof asset === 'string' && StrKey.isValidContract(asset) || StrKey.isValidContract(destination))
        return prepareContractPaymentOperation(transfer, builder)
    //account creation
    if (transfer.createDestination && transfer.asset[0] === 'XLM') {
        builder.addOperation(Operation.createAccount({
            source: transfer.source,
            startingBalance: transfer.amount[0],
            destination: transfer.destination
        }))
    } else { //regular transfer
        builder.addOperation(Operation.payment({
            source: transfer.source,
            destination: transfer.destination,
            asset: AssetDescriptor.parse(transfer.asset[0]).toAsset(),
            amount: transfer.amount[0]
        }))
    }
    return builder.build()
}

async function prepareContractPaymentOperation(transfer, builder) {
    const {network} = transfer
    //prepare params
    const contractArgs = [ //standard transfer args - from, to, amount
        new Address(transfer.source).toScVal(),
        new Address(transfer.destination).toScVal(),
        new XdrLargeInt('i128', toStroops(transfer.amount[0])).toI128()
    ]
    //resolve token contract address
    const contractId = getSacContractAddress(transfer.asset[0], network)
    //build invocation
    const contract = new Contract(contractId)
    builder.addOperation(contract.call('transfer', ...contractArgs))
    let tx = builder.build()
    //execute simulation
    const rpc = resolveNetworkParams({network}).createRpc()
    const simulation = await simulateTx(tx, rpc)
    if (simulation.restorePreamble)
        throw new Error('Transaction requires state restore')

    const newBuilder = TransactionBuilder.cloneFrom(tx, {
        sorobanData: simulation.transactionData.build(),
        fee: (parseInt(simulation.minResourceFee) + parseInt(tx.fee) + 100).toString()
    })
    newBuilder.clearOperations()

    const invokeOp = tx.operations[0]
    newBuilder.addOperation(Operation.invokeHostFunction({
        source: invokeOp.source,
        func: invokeOp.func,
        auth: simulation.result.auth
    }))
    tx = newBuilder.build()
    return tx
}

function prepareClaimableBalanceOperation(transfer, builder) {
    const claimants = [new Claimant(transfer.destination, Claimant.predicateUnconditional())]
    //add self as a claimant
    if (transfer.destination !== transfer.source) {
        claimants.push(new Claimant(transfer.source, Claimant.predicateUnconditional()))
    }
    builder.addOperation(Operation.createClaimableBalance({
        source: transfer.source,
        asset: AssetDescriptor.parse(transfer.asset[0]).toAsset(),
        amount: transfer.amount[0],
        claimants
    }))
    return builder.build()
}

function prepareTrustline(transfer, builder) {
    if (transfer.createTrustline) {
        builder.addOperation(Operation.changeTrust({asset: AssetDescriptor.parse(transfer.asset[1]).toAsset()}))
    }
}