import {useEffect, useState} from 'react'
import {useStellarNetwork} from '../../../state/network-selector'
import {createHorizon} from '../../../util/horizon-connector'

export function useLiquidityPoolInfo(poolId) {
    const network = useStellarNetwork(),
        [poolInfo, setPoolInfo] = useState(null)
    useEffect(function () {
        if (!poolId) {
            setPoolInfo(null)
            return
        }
        createHorizon({network})
            .liquidityPools()
            .liquidityPoolId(poolId)
            .call()
            .then(function (res) {
                setPoolInfo(res)
            })
    }, [poolId, network])
    return poolInfo
}