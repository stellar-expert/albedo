import {Server} from 'stellar-sdk'
import {resolveNetworkParams} from './network-resolver'

/**
 * Create and init Horizon server wrapper instance.
 * @param {String} network
 * @return {Server}
 */
export function createHorizon(network) {
    let horizon
    if (network.network) {
        horizon = network.horizon
        network = network.network
    }
    const {horizon: selectedHorizon} = resolveNetworkParams({network, horizon})
    return new Server(selectedHorizon)
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