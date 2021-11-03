import {createHorizon} from './horizon-connector'

const cache = {}

export async function resolvePoolParams(network, poolId, forceUpdate = false) {
    let prev = cache[poolId]
    if (prev && !forceUpdate && prev.ts + 10000 >= new Date().getTime()) return prev.value
    let poolInfo
    try {
        poolInfo = await createHorizon({network})
            .liquidityPools()
            .liquidityPoolId(poolId)
            .call()
    } catch (e) {
        poolInfo = null
    }
    cache[poolId] = {
        ts: new Date().getTime(),
        value: poolInfo
    }
    return poolInfo
}