import {StrKey} from 'stellar-sdk'
import {parseTxOperationsMeta} from '@stellar-expert/tx-meta-effects-parser'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import OperationDescriptor from './op-descriptor'
import {matchOperationContext} from './op-matcher'

/**
 * @typedef {Object} ParsedTxDetails - Parsed transaction
 * @property {OperationDescriptor[]} operations - Parsed operation descriptors
 * @property {Transaction|FeeBumpTransaction} tx - Parsed transaction
 * @property {String} txHash - Transaction hash
 * @property {String} context - Account address, asset name, offer id
 * @property {String} contextType - Resolved context type
 * @property {Boolean} isEphemeral - True if transaction has not been submitted or rejected
 * @property {Boolean} unmatched - Whether transaction matches context and filter
 * @property {Boolean} successful? - Whether the transaction has been executed successfully or failed during execution
 * @property {{}[]} txEffects? - Transaction-level effects (fee charges)
 * @property {String} createdAt? - Ledger application timestamp
 */

/**
 * Parse tx details from raw envelope, result, and meta
 * @param {String} network - Network passphrase or identifier
 * @param {String} tx - Base64-encoded tx envelope xdr
 * @param {String} result? - Base64-encoded tx envelope result
 * @param {String} meta? - Base64-encoded tx envelope meta
 * @param {String} context - Account address, asset name, offer id
 * @param {'payments'|'trading'|'settings'} filter - Operations filter
 * @param {String} createdAt? - Ledger execution timestamp
 * @param {Boolean} skipUnrelated? - Skip operations and effects that are not directly related to the filter context
 * @return {ParsedTxDetails}
 */
export function parseTxDetails({network, txEnvelope, result, meta, context, filter, createdAt, skipUnrelated}) {
    const contextType = resolveContextType(context)
    const {tx, operations, effects, isEphemeral, failed} = parseTxOperationsMeta({network, tx: txEnvelope, meta, result})
    const txEffects = effects.filter(e => contextType === 'none' || contextType === 'asset' && context === 'XLM' || contextType === 'account' && context === e.source)
    const txHash = tx.hash().toString('hex')

    const parsedOps = OperationDescriptor.parseOperations(operations, txHash, context, contextType, isEphemeral, !isEphemeral && !failed)
        .filter(od => matchOperationContext(od, filter))

    const res = {
        operations: parsedOps,
        tx,
        txHash,
        context,
        contextType,
        isEphemeral,
        unmatched: !parsedOps.length && !txEffects.length,
        txEffects
    }
    if (createdAt) {
        res.createdAt = createdAt
    }
    if (!isEphemeral) {
        res.successful = !failed
    }
    for (let op of parsedOps){
        op.tx = res
    }
    return res
}

/**
 * @param {String} context
 * @return {'none'|'account'|'asset'|'offer'}
 * @internal
 */
function resolveContextType(context) {
    if (context !== null && context !== undefined) {
        if (StrKey.isValidEd25519PublicKey(context))
            return 'account'
        if (/\d+/.test(context))
            return 'offer'
        try {
            AssetDescriptor.parse()
            return 'asset'
        } catch {
        }
    }
    return 'none'
}