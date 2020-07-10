import {Asset, Memo, Operation, TransactionBuilder} from 'stellar-sdk'
import {zeroAccount} from '../util/signature-hint-utils'
import {createHorizon} from '../util/horizon-connector'
import {resolveNetworkParams} from '../util/network-resolver'
import standardErrors from '../util/errors'

/**
 * Normalize memo type to the values accepted by Memo.
 * @param {String} memoType - Memo type.
 * @return {String}
 */
function normalizeMemoType(memoType) {
    if (!memoType) return 'text' //text by default
    const type = memoType.split('_').pop().toLowerCase()
    if (!['text', 'id', 'hash', 'return'].includes(type)) return 'text' //invalid type - treat as MEMO_TEXT
    return type
}

function predictOptimalFee({last_ledger_base_fee, max_fee}) {
    return Math.min(last_ledger_base_fee * 2, parseInt(max_fee.p80))
}

/**
 * Build a transactions from a given set of operations.
 * @param {ActionContext} actionContext - Current action context.
 * @param {String} publicKey - Public key for the account keypair selected by the user.
 * @returns {Transaction} Composed Stellar transaction.
 */
async function buildTx(actionContext, publicKey) {
    const {intentParams} = actionContext,
        {network} = resolveNetworkParams(intentParams),
        horizon = createHorizon(intentParams)

    //fetch source account sequence and fee stats from Horizon
    const [source, feeStats] = await Promise.all([
        horizon.loadAccount(publicKey),
        horizon.feeStats()])

    //create builder with unlimited timeout and calculated fee
    const tx = new TransactionBuilder(source, {
        fee: predictOptimalFee(feeStats),
        networkPassphrase: resolveNetworkParams(intentParams).network
    })
        .setTimeout(10000000)

    //prepare operations depending on the intent
    const ops = await prepareTxOperations(actionContext, source)
    for (const op of ops) {
        tx.addOperation(op)
    }

    //add tx memo if requested
    const {memo, memo_type} = intentParams
    if (memo) {
        tx.addMemo(new Memo(normalizeMemoType(memo_type), memo))
    }
    //build tx
    return tx.build()
}

/**
 * Build list of transaction operations depending on the intent.
 * @param {ActionContext} actionContext - Current action context.
 * @param {AccountResponse} source - Account info for the account keypair selected by the user.
 * @return {Promise<Array<xdr.Operation>>}
 */
async function prepareTxOperations(actionContext, source) {
    const {intent, intentParams} = actionContext
    switch (intent) {
        case 'pay': {
            const {amount, destination, asset_code, asset_issuer} = intentParams,
                asset = asset_issuer ? new Asset(asset_code, asset_issuer) : Asset.native()
            return [Operation.payment({asset, amount, destination})]
        }
        case 'trust': {
            const {asset_code, asset_issuer, limit = '922337203685.4775807'} = intentParams
            return [Operation.changeTrust({asset: new Asset(asset_code, asset_issuer), limit})]
        }
        case 'exchange': {
            const {sell_asset_code, sell_asset_issuer, max_price, buy_asset_code, buy_asset_issuer, amount} = intentParams,
                destAsset = buy_asset_issuer ? new Asset(buy_asset_code, buy_asset_issuer) : Asset.native(),
                operations = []

            //calculate send max amount from max price the user willing to pay
            const sendMax = (Math.floor(amount * 10000000 / max_price) / 10000000).toFixed(7)

            //check whether the trustline exists
            const trustlineExists = source.balances.some(balance =>
                balance.asset_code === buy_asset_code //TODO: check for XLM payments
                && balance.asset_issuer === buy_asset_issuer)
            //create the trustline
            if (!trustlineExists) {
                operations.push(Operation.changeTrust({asset: destAsset, limit: '922337203685.4775807'}))
            }
            //execute market order using path payment op
            operations.push(Operation.pathPaymentStrictReceive({
                sendAsset: sell_asset_issuer ? new Asset(sell_asset_code, sell_asset_issuer) : Asset.native(),
                sendMax,
                destination: source.account_id, //self-payment
                destAsset,
                destAmount: amount
            }))

            return operations
        }
    }
    throw new Error(`Intent ${intent} is not a tx action.`)
}

/**
 * Process user action with tx intent request.
 * @param {ActionContext} actionContext
 * @param {String} publicKey
 * @param {ActionExecutionContext} executionContext
 * @returns {Promise}
 */
async function processTxIntent({actionContext, executionContext}) {
    try {
        let {txContext, intent, intentParams, intentProps} = actionContext
        if (!txContext) {
            const tx = await buildTx(actionContext, executionContext.publicKey)
            txContext = await actionContext.setTxContext(tx)
        }

        await txContext.signDirect(executionContext)

        const {network, horizon} = txContext
        //prepare return params
        const res = {
            intent,
            pubkey: executionContext.publicKey,
            network: network || 'public'
        }

        //copy other fields from request
        const fieldsToCopyFromRequest = [...intentProps.returns, 'memo', 'memo_type']
        for (let field of fieldsToCopyFromRequest) {
            const val = intentParams[field]
            if (val) res[field] = val
        }

        const {tx} = txContext,
            hash = tx.hash().toString('hex'),
            envelopeXdr = tx.toEnvelope().toXDR().toString('base64')

        if (actionContext.autoSubmitToHorizon) {
            let result
            //submit a transaction to Horizon
            try {
                await new Promise(resolve => {
                })
                result = await createHorizon(intentParams)
                    .submitTransaction(tx)
            } catch (e) {

            }
            //TODO: think about returning raw tx result, maybe it's not needed as the transaction can be always fetched by its hash, but still...
            Object.assign(res, {
                tx_hash: hash,
                signed_envelope_xdr: envelopeXdr,
                result,
                horizon
            })
        } else {
            //just prepare a signed envelope
            Object.assign(res, {
                tx_hash: hash,
                signed_envelope_xdr: envelopeXdr
            })
        }
        return res
    } catch (err) {
        //TODO: too general error handler - split into a few separate try-catch blocks to handle specific errors individually
        console.error(err)
        //something wrong with the network connection
        if (err.message === 'Network Error')
            throw standardErrors.externalError('Network error.')
        if (err.response) { //treat as Horizon error
            if (err.response.status === 404)
                throw standardErrors.externalError(new Error('Source account doesn\'t exist on the network.'))
            throw standardErrors.externalError('Horizon error.')
        }
        //unhandled error
        //TODO: add detailed error description
        throw new Error('Failed to process the transaction.')
    }
}

export default function (responder) {
    responder.registerReaction('trust', processTxIntent)

    responder.registerReaction('pay', processTxIntent)

    responder.registerReaction('tx', processTxIntent)

    responder.registerReaction('exchange', processTxIntent)
}
