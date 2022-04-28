import {resolveNetworkParams} from './network-resolver'

/**
 * Create and init Horizon server wrapper instance.
 * @param {String|{network: String, [horizon]: string}} network - Network passphrase or network descriptor.
 * @return {Server}
 */
export function createHorizon(network) {
    let horizon
    if (network.network) {
        horizon = network.horizon
        network = network.network
    }
    return resolveNetworkParams({network, horizon}).createHorizon()
}

/**
 * Create and fund account on the testnet using friendbot service.
 * @param {String} address - Stellar account address
 * @return {Promise<Response | void>}
 */
export function requestFriendbotFunding(address) {
    return fetch('https://friendbot.stellar.org/?addr=' + address)
        .catch(err => console.error(err))
        .then(() => true)
}