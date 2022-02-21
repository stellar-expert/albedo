import {createHorizon} from './horizon-connector'

const ledgersCache = {}

/**
 * Fetch current ledger sequence from Horizon
 * @param {String} network
 * @return {Promise<Number>}
 */
export async function getCurrentLedger(network) {
    try {
        let {ledger, ts = 0} = ledgersCache[network] || {}
        if (new Date().getTime() - ts < 5000) return ledger

        const {records} = await createHorizon({network})
            .ledgers()
            .order('desc')
            .limit(1)
            .call()
        ledger = records[0].sequence
        ledgersCache[network] = {ledger, ts: new Date().getTime()}
        return ledger
    } catch (e) {
        return 0
    }
}