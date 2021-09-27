import {Networks, TransactionBuilder, Transaction} from 'stellar-sdk'
import BigNumber from 'bignumber.js'

export function retrieveOperations(tx, network) {
    let parsed = typeof tx.envelope_xdr === 'string' ? TransactionBuilder.fromXDR(tx.envelope_xdr, Networks[network.toUpperCase()]) : tx
    //handle fee bumps
    if (parsed.innerTransaction) {
        parsed = parsed.innerTransaction
    }
    if (parsed.operations) {
        parsed.operations.map((op, i) => {
            const opid = new BigNumber(tx.paging_token || 0).add(i + 1)
            op.id = opid.toString()
            return op
        })
        if (!(tx instanceof Transaction)) {
            tx.operations = parsed.operations
        }
    } else {
        tx.operations = []
    }
    return tx
}