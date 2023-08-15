import {createHorizon} from './horizon-connector'

const refreshPeriod = 2000 // 2 seconds
let lastFetched = 0 // last fetched timestamp
let feePromise // cached fee resolver promise
let estimatedFee // last estimated fee value

/**
 * Estimate base fee for a transaction submission with a given confidence
 * @param {String} network - Network id or passphrase
 * @param {'low', 'normal', 'high'} [confidence] - Estimation confidence
 * @return {Promise<String>}
 */
function estimateFee(network, confidence = 'normal') {
    return fetchEstimates(network, confidence)
        .then(estimates => estimates[confidence])
}

function fetchEstimates(network, confidence) {
    if (feePromise) // return a cached promise if the fee fetching process is in progress
        return feePromise
    const now = new Date().getTime()
    // do not refresh if we have a recently obtained result
    if (now - lastFetched < refreshPeriod)
        return Promise.resolve(estimatedFee)
    // fetch fee stats from Horizon
    feePromise = createHorizon(network)
        .feeStats()
        .then(feeStats => {
            estimatedFee = calculateEstimates(feeStats)
            lastFetched = new Date().getTime()
            feePromise = undefined
            return estimatedFee
        })
    return feePromise
}

function calculateEstimates({fee_charged, max_fee, ledger_capacity_usage, last_ledger_base_fee}) {
    return {
        low: computeFee(last_ledger_base_fee * 10, fee_charged.p20, 1),
        normal: computeFee(max_fee.p50, fee_charged.p50, 2),
        high: computeFee(max_fee.p90, fee_charged.p90, 10)
    }
}

function computeFee(maxStake, actualStake, multiplayer) {
    maxStake = parseInt(maxStake, 10)
    actualStake = parseInt(actualStake, 10)
    return (Math.min(maxStake, actualStake * multiplayer) + 10).toString()
}