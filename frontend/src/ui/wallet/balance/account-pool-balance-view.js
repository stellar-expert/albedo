import React, {useEffect, useState} from 'react'
import {AssetIcon, AssetIssuer, useStellarNetwork} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {estimateLiquidityPoolStakeValue} from '@stellar-expert/liquidity-pool-utils'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import ActionLoaderView from '../shared/action-loader-view'
import BalanceAmount from './balance-amount'

export default function AccountPoolBalanceView({balance, asset}) {
    const [poolInfo, setPoolInfo] = useState()
    const network = useStellarNetwork()
    const poolId = asset.toString()

    useEffect(() => {
        let unloaded = false
        resolvePoolParams(network, poolId, true)
            .then(res => {
                if (unloaded) return
                setPoolInfo(res)
            })
        return () => {
            unloaded = true
        }
    }, [poolId])

    if (!poolInfo)
        return <ActionLoaderView message="loading pool info"/>

    const stake = poolInfo.total_shares
    const reserves = poolInfo.reserves.map(r => r.amount)
    const assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset))
    const stakeValue = estimateLiquidityPoolStakeValue(balance.balance, reserves, stake) || ['0', '0']

    return <>
        <div className="account-balance liquidity-pool">
            <div style={{width: '3.7em'}}>
                <div>
                    <AssetIcon asset={assets[0]}/>
                </div>
                <div>
                    <AssetIcon asset={assets[1]}/>
                </div>
            </div>
            <div className="text-left">
                <div>
                    <div className="asset-code">{assets[0].code}</div>
                    <AssetIssuer asset={assets[0]}/>
                </div>
                <div>
                    <div className="asset-code">{assets[1].code}</div>
                    <AssetIssuer asset={assets[1]}/>
                </div>
            </div>
            <div>
                <BalanceAmount amount={stakeValue[0]}/>
                <BalanceAmount amount={stakeValue[1]}/>
            </div>
        </div>
        <div className="account-balance-actions">
            {/*<a href={'/wallet/liquidity-pool/deposit?pool=' + poolId}>add liquidity</a>&emsp;*/}
            <a href={'/wallet/liquidity-pool/withdraw?pool=' + poolId}><i className="icon-angle-double-right"/>withdraw liquidity</a>
        </div>
    </>
}