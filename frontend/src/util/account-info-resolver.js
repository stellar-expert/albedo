import {createHorizon} from './horizon-connector'

const accountCache = {}

setInterval(function () { //periodic cache cleanup
    const now = new Date().getTime()
    for (let key of Object.keys(accountCache)) {
        const {expires} = accountCache[key]
        if (expires <= now) {
            delete accountCache[key]
        }
    }
}, 10000)

function fetchAccountInfo(address, network) {
    return createHorizon(network).loadAccount(address)
}

/**
 * Load account information from Horizon.
 * @param {String} address - Stellar account address.
 * @param {StellarNetworkParams|String} network - Network identifier or network params.
 * @return {Promise<AccountResponse>}
 */
export function resolveAccountInfo(address, network) {
    if (network.network) {
        network = network.network
    }
    const key = `${network}-${address}}`
    let {meta, expires} = accountCache[key] || {}
    if (!meta || expires <= new Date().getTime()) {
        meta = fetchAccountInfo(address, network)
        accountCache[key] = {meta, expires: new Date().getTime() + 2000} //set 2 sec cache expiration timeout
    }
    return meta
}