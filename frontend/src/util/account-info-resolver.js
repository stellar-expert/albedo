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
    const horizon = createHorizon({network})
    return horizon.loadAccount(address)
}

export function resolveAccountInfo(address, network) {
    const key = `${network}-${address}}`
    let {meta, expires} = accountCache[key]
    if (!meta || expires <= new Date().getTime()) {
        meta = fetchAccountInfo(address, network)
        accountCache[key] = {meta, expires: new Date().getTime() + 3000} //set 3 sec cache expiration timeout
    }
    return meta
}