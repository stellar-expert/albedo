import {Asset, Memo, Operation, TransactionBuilder} from '@stellar/stellar-base'
import Bignumber from 'bignumber.js'
import {intentInterface} from '@albedo-link/intent'
import {resolveNetworkParams} from '../util/network-resolver'
import {estimateFee} from '../util/fee-estimator'
import standardErrors from '../util/errors'
import {resolveAccountInfo} from '../util/account-info-resolver'
import {runInAction} from 'mobx'
import {handleTxError} from './tx-error-handler'

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

/**
 * Build a transactions from a given set of operations.
 * @param {ActionContext} actionContext - Current action context.
 * @param {IntentRequest} intentRequest - Current intent request.
 * @param {String} publicKey - Public key for the account keypair selected by the user.
 * @returns {Transaction} Composed Stellar transaction.
 */
async function buildTx(actionContext, intentRequest, publicKey) {
    const {intentParams} = intentRequest,
        networkParams = resolveNetworkParams(intentParams)

    //fetch source account sequence and fee stats from Horizon
    const [source, fee] = await Promise.all([
        resolveAccountInfo(publicKey, networkParams),
        estimateFee(networkParams)
    ])

    //create builder with unlimited timeout and calculated fee
    const tx = new TransactionBuilder(source, {
        fee,
        networkPassphrase: networkParams.network
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
            if (!asset_issuer) {
                try {
                    const acc = await resolveAccountInfo(destination, actionContext.networkParams)
                } catch (e) {
                    if (e.name === 'NotFoundError') {
                        return [Operation.createAccount({startingBalance: amount, destination})]
                    }
                }
            }
            return [Operation.payment({asset, amount, destination})]
        }
        case 'trust': {
            const {asset_code, asset_issuer, limit = '922337203685.4775807'} = intentParams
            return [Operation.changeTrust({asset: new Asset(asset_code, asset_issuer), limit})]
        }
        case 'exchange': {
            const {
                    sell_asset_code,
                    sell_asset_issuer,
                    max_price,
                    buy_asset_code,
                    buy_asset_issuer,
                    amount
                } = intentParams,
                destAsset = buy_asset_issuer ? new Asset(buy_asset_code, buy_asset_issuer) : Asset.native(),
                operations = []

            //calculate send max amount from max price the user willing to pay
            const sendMax = (BigInt(parseFloat(max_price) * 10000000 * amount) / 10000000n).toFixed(7)

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
 * @param {IntentRequest} intentRequest
 * @param {ActionAuthenticationContext} executionContext
 * @returns {Promise}
 */
async function processTxIntent({actionContext, intentRequest, executionContext}) {
    let {txContext, intent, intentParams} = intentRequest
    const intentInterfaceProps = intentInterface[intent]
    try {
        if (!txContext) {
            const tx = await buildTx(actionContext, intentRequest, executionContext.publicKey)
            txContext = await intentRequest.setTxContext(tx, actionContext.selectedAccount)
        }

        if (!await txContext.sign(executionContext))
            return null

        const {network} = txContext
        //prepare return params
        const res = {
            intent,
            pubkey: executionContext.publicKey,
            network: network || 'public'
        }

        //copy other fields from request
        const fieldsToCopyFromRequest = [...Object.keys(intentInterfaceProps.returns), 'memo', 'memo_type']
        for (let field of fieldsToCopyFromRequest) {
            const val = intentParams[field]
            if (val) res[field] = val
        }

        //retrieve hash and tx envelope
        const {tx} = txContext,
            hash = tx.hash().toString('hex'),
            envelopeXdr = tx.toEnvelope().toXDR().toString('base64')

        Object.assign(res, {
            tx_hash: hash,
            signed_envelope_xdr: envelopeXdr
        })

        return res
    } catch (err) {
        handleTxError(err, actionContext)
    }
}

export default function (registerReaction) {
    registerReaction('trust', processTxIntent)

    registerReaction('pay', processTxIntent)

    registerReaction('tx', processTxIntent)

    registerReaction('exchange', processTxIntent)
}
