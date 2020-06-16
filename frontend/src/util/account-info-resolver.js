import {createHorizon} from './horizon-connector'

//TODO: add cache expiration logic
const accountCache = {}

function fetchAccountInfo(address, networkId) {
    const horizon = createHorizon({network: networkId})
    return horizon.loadAccount(address)
}

export function resolveAccountInfo(address, networkId){
    const key = `${networkId}-${address}}`
    let meta = accountCache[key]
    if (!meta) {
        meta = accountCache[key] = fetchAccountInfo(address, networkId)
    }
    return meta
}