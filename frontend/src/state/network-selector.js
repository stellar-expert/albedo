import {useState, useEffect} from 'react'

const listeners = [],
    lsKey = 'preferredNetwork'
let currentNetwork = localStorage.getItem(lsKey) || 'testnet'

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
    currentNetwork = network
    localStorage.setItem(lsKey, network)
    for (const listener of listeners) {
        listener(network)
    }
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