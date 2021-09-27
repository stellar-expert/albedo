import {createHorizon} from './horizon-connector'

let baseFee = '100',
    estimatedFee = '110',
    maxFee = 200000,
    lastFetched = 0,
    callPromise

export function estimateFee(network) {
    if (callPromise) return callPromise
    if (new Date().getTime() - lastFetched < 3000) return Promise.resolve(estimatedFee)

    callPromise = createHorizon(network)
        .feeStats()
        .then(({fee_charged, last_ledger_base_fee}) => {
            baseFee = last_ledger_base_fee
            estimatedFee = (Math.min(parseInt(fee_charged.mode) + 10, maxFee)).toString()
            lastFetched = new Date().getTime()
            return estimatedFee
        })
    return callPromise
}