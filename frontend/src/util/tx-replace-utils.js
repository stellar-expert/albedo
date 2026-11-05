import {Keypair, Transaction, TransactionBuilder, xdr as xdrTypes} from '@stellar/stellar-sdk'

export const zeroAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

/**
 * Create a copy of the transaction with modified transaction body fields (transactions are immutable).
 * @param {Transaction} tx - Original transaction.
 * @param {Object} changes - Body fields to override.
 * @return {Transaction}
 */
function rebuildTransaction(tx, changes) {
    const envelope = tx.toEnvelope()
    const {tx: body, signatures} = envelope.value
    let newEnvelope
    if (envelope.type === 'envelopeTypeTxV0') {
        newEnvelope = xdrTypes.TransactionEnvelope.envelopeTypeTxV0(new xdrTypes.TransactionV0Envelope({
            tx: new xdrTypes.TransactionV0({...body, ...changes}),
            signatures
        }))
    } else {
        newEnvelope = xdrTypes.TransactionEnvelope.envelopeTypeTx(new xdrTypes.TransactionV1Envelope({
            tx: new xdrTypes.Transaction({...body, ...changes}),
            signatures
        }))
    }
    return new Transaction(newEnvelope, tx.networkPassphrase)
}

/**
 * Create a copy of the transaction, substituting sourceAccount parameter with a provided value.
 * @param {Transaction} tx - Stellar transaction to modify.
 * @param {String} sourceAccount - Account public key that will be used as a source account.
 * @return {Transaction}
 */
export function substituteSourceAccount(tx, sourceAccount) {
    const keypair = Keypair.fromPublicKey(sourceAccount)
    if (tx.toEnvelope().type === 'envelopeTypeTxV0')
        return rebuildTransaction(tx, {sourceAccountEd25519: keypair.rawPublicKey()})
    return rebuildTransaction(tx, {sourceAccount: keypair.xdrMuxedAccount()})
}

/**
 * Create a copy of the transaction, substituting sequence number with a provided value.
 * @param {Transaction} tx - Stellar transaction to modify.
 * @param {String} newSequence
 * @return {Transaction}
 */
export function substituteSourceSequence(tx, newSequence) {
    return rebuildTransaction(tx, {seqNum: BigInt(newSequence)})
}

/**
 * Process SEP-7 replacement tokens.
 * @param {Object} intentParams
 * @param {StellarNetworkParams} networkParams
 */
export function replaceTokens(intentParams, networkParams) {
    const {xdr, replace, network} = intentParams
    if (!xdr || !replace) return

    const replacementParts = replace.split(',')
        .map(pair => pair.split(':'))

    let parsedTx = TransactionBuilder.fromXdr(xdr, networkParams.network)

    //we only support sourceAccount replacement for now
    for (let pair of replacementParts) {
        if (pair[0] !== 'sourceAccount') continue
        parsedTx = substituteSourceAccount(parsedTx, zeroAccount) //replace with zero account for further processing
        //parsedTx = substituteSourceSequence(parsedTx, '0')
    }

    intentParams.xdr = parsedTx.toXdr()
}
