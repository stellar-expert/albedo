import {Networks} from '@stellar/stellar-base'
import {Horizon} from '@stellar/stellar-sdk'
import appSettings from '../state/app-settings'

class StellarNetworkParams {

    network = 'public'

    networkName = 'public'

    horizon = appSettings.networks.public.horizon

    createHorizon() {
        return new Horizon.Server(this.horizon)
    }
}

/**
 * Resolve Stellar network identifier based on the intent settings.
 * @param {String} [network] - Stellar network id or passphrase.
 * @param {String} [horizon] - Horizon server URL (optional for predefined networks).
 * @return {StellarNetworkParams}
 */
export function resolveNetworkParams({network, horizon}) {
    const params = new StellarNetworkParams()
    params.horizon = horizon

    if (!network) {
        //no network provided - use pubnet settings by default
        network = 'public'
    }
    //try to find matching predefined network passphrase
    for (const key of Object.keys(Networks)) {
        if (Networks[key] === network) {
            network = params.networkName = key.toLowerCase()
            break
        }
    }
    //try to fetch network details from the app config by name (predefined are "public" and "testnet")
    const networkSettings = appSettings.networks[network.toLowerCase()]
    if (networkSettings) {
        params.networkName = network
        //use passphrase from predefined networks
        params.network = Networks[network.toUpperCase()]
        if (!horizon) {
            //use predefined Horizon URL if none was provided
            params.horizon = networkSettings.horizon
        }
    } else {
        //we assume that a client provided network passphrase instead of network identifier - use it as is
        params.network = network
        //in this case, a client should provide the horizon endpoint explicitly
        if (!params.horizon) throw new Error(`No Horizon server endpoint provided with custom network "${network}".`)
        params.networkName = 'private network'
    }

    Object.freeze(params)

    return params
}

export function isTestnet({network = 'public'}) {
    return network.toLowerCase() === 'testnet' || network === Networks.TESTNET
}

