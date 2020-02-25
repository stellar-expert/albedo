import appSettings from '../app-settings'
import {Networks} from 'stellar-base'

/**
 * Resolve Stellar network identifier based on the intent settings.
 * @param {String} [network] - Stellar network id or passphrase.
 * @param {String} [horizon] - Horizon server URL (optional for predefined networks).
 * @return {{network: String, horizon: String}}
 */
function resolveNetworkParams({network, horizon}) {
    let selectedNetwork,
        selectedHorizon = horizon
    if (!network) {
        //no network provided - use pubnet settings by default
        network = 'public'
    }
    //try to fetch network details from the app config by name (predefined are "public" and "testnet")
    const networkSettings = appSettings.networks[network.toLowerCase()]
    if (networkSettings) {
        //use passphrase from predefined networks
        selectedNetwork = Networks[network.toUpperCase()]
        if (!horizon) {
            //use predefined Horizon URL if none was provided
            selectedHorizon = networkSettings.horizon
        }
    } else {
        //we assume that a client provided network passphrase instead of network identifier - use it as is
        selectedNetwork = network
        //in this case, a client should provide the horizon endpoint explicitly
        if (!selectedHorizon) throw new Error(`No Horizon server endpoint provided with custom network "${network}".`)
    }

    return {
        network: selectedNetwork,
        horizon: selectedHorizon
    }
}

export {resolveNetworkParams}

