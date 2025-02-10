import {createHorizon} from './horizon-connector'

const refreshPeriod = 3000 // 3 seconds
let lastFetched = 0 // last fetched timestamp
let feePromise // cached fee resolver promise
let feeStats // last fetched fee statistics

/**
 * Estimate base fee for a transaction submission with a given confidence
 * @param {String|StellarNetworkParams} network - Network id or passphrase
 * @param {'low', 'normal', 'high', 'highest'} [confidence] - Estimation confidence
 * @return {Promise<String>}
 */
export function estimateFee(network, confidence = 'normal') {
    return fetchStats(network)
        .then(() => calculateFeeEstimate(confidence))
}


function fetchStats(network) {
    if (feePromise) // return a cached promise if the fee fetching process is in progress
        return feePromise
    const now = new Date().getTime()
    // do not refresh if we have a recently obtained result
    if (now - lastFetched < refreshPeriod)
        return Promise.resolve(feeStats)
    // fetch fee stats from Horizon
    feePromise = createHorizon(network)
        .feeStats()
        .then(response => {
            feeStats = response
            lastFetched = new Date().getTime()
            feePromise = undefined
            return response
        })
    return feePromise
}

function calculateFeeEstimate(confidence) {
    const {fee_charged, max_fee, ledger_capacity_usage, last_ledger_base_fee} = feeStats
    switch (confidence) {
        case 'low':
            return computeFee(feeStats.last_ledger_base_fee * 10, feeStats.fee_charged.p20, 1)
        case 'normal':
            return computeFee(max_fee.p60, fee_charged.p60, 1.1)
        case 'high':
            return computeFee(max_fee.p90, fee_charged.p90, 1.2)
        case 'highest':
            return (parseInt(max_fee.max, 10) * 1.05).toFixed(0)
    }
}

function computeFee(max, actual, multiplayer) {
    max = parseInt(max, 10)
    actual = parseInt(actual, 10)
    return (Math.min(max, actual * multiplayer) + 10).toFixed(0)
}