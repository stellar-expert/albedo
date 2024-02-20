import {Keypair, TransactionBuilder, xdr as xdrTypes} from '@stellar/stellar-base'

export const zeroAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

/**
 * Modify a transaction, substituting sourceAccount parameter with a provided value.
 * @param {Transaction} tx - Stellar transaction to modify.
 * @param {String} sourceAccount - Account public key that will be used as a source account.
 */
export function substituteSourceAccount(tx, sourceAccount) {
    tx._source = sourceAccount
    tx.tx._attributes.sourceAccountEd25519 = Keypair.fromPublicKey(sourceAccount).xdrAccountId().ed25519() //update nested xdr
}

/**
 * Modify a transaction, substituting sequence number with a provided value.
 * @param {Transaction} tx - Stellar transaction to modify.
 * @param {String} newSequence
 */
export function substituteSourceSequence(tx, newSequence) {
    newSequence = newSequence.toString() //ensure that int64 is represented as string
    tx._sequence = newSequence
    tx.tx._attributes.seqNum = xdrTypes.SequenceNumber.fromString(newSequence)
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

    const parsedTx = TransactionBuilder.fromXDR(xdr, networkParams.network)

    //we only support sourceAccount replacement for now
    for (let pair of replacementParts) {
        if (pair[0] !== 'sourceAccount') continue
        substituteSourceAccount(parsedTx, zeroAccount) //replace with zero account for further processing
        //substituteSourceSequence(parsedTx, '0')
    }

    intentParams.xdr = parsedTx.toXDR()
}