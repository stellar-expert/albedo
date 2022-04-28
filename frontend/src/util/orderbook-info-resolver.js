import {createHorizon} from './horizon-connector'

export async function resolveOrderbookInfo(network, assets, limit) {
    if (!assets?.length || assets[0] === assets[1]) return null
    let poolInfo
    try {
        poolInfo = await createHorizon(network)
            .orderbook(assets[0], assets[1])
            .limit(limit)
            .call()
    } catch (e) {
        poolInfo = null
    }
    return poolInfo
}