import {useEffect, useState} from 'react'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {createHorizon} from '../../../util/horizon-connector'

export function useLiquidityPoolInfo(poolId, dependencies = []) {
    const network = useStellarNetwork()
    const [poolInfo, setPoolInfo] = useState(undefined)
    useEffect(function () {
        if (!poolId) {
            setPoolInfo(undefined)
            return
        }
        createHorizon({network})
            .liquidityPools()
            .liquidityPoolId(poolId)
            .call()
            .then(res => setPoolInfo(res || null))
            .catch(() => setPoolInfo(null))
    }, [poolId, network, ...dependencies])
    return poolInfo
}