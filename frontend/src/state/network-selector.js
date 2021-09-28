import {useState, useEffect} from 'react'
import storageProvider from './storage/storage-provider'

const listeners = [],
    lsKey = 'preferredNetwork'
let currentNetwork = 'public'

//load from
storageProvider.getItem(lsKey)
    .then(network => {
        if (network) {
            setStellarNetwork(network)
        }
    })

function removeListener(callback, newCallback) {
    const idx = listeners.indexOf(callback)
    if (~idx) listeners.splice(idx, 1)
    if (newCallback) listeners.push(newCallback)
}

/**
 * Set current Stellar network.
 * @param {'testnet'|'public'} network
 */
export function setStellarNetwork(network) {
    if (currentNetwork === network) return
    currentNetwork = network
    window.explorerNetwork = network
    storageProvider.setItem(lsKey, network)
        .then(() => {
            for (const listener of listeners) {
                listener(network)
            }
        })
        .catch(e => console.error(e))
}

/**
 * Get current Stellar network.
 * @return {'testnet'|'public'}
 */
export function getStellarNetwork() {
    return currentNetwork
}

/**
 * React hook for reacting on Stellar network changes.
 * @return {'testnet'|'public'}
 */
export function useStellarNetwork() {
    const [state, updateState] = useState(currentNetwork)
    useEffect(() => {
        removeListener(updateState)
        listeners.push(function (network) {
            updateState(network)
        })
        return () => {
            removeListener(updateState)
        }
    }, [])
    return state
}