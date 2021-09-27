import {createHorizon} from './horizon-connector'

/**
 *
 * @param {'public'|'testnet'} network
 * @param {Function} onNewLedger
 * @param {String} [cursor]
 * @return {Function}
 */
export function streamLedgers({network, onNewLedger, cursor}) {
    return createHorizon({network})
        .ledgers()
        .limit(200)
        .order('asc')
        .cursor(cursor || 'now')
        .stream({
            onmessage: ledger => onNewLedger(ledger),
            reconnectTimeout: 60000
        })
}