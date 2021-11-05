import React, {useEffect, useState} from 'react'
import {
    AccountAddress,
    AssetDescriptor,
    useAssetMeta,
    formatCurrency,
    estimateLiquidityPoolStakeValue,
    useStellarNetwork
} from '@stellar-expert/ui-framework'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import './account-balance.scss'

function AssetIcon({asset}) {
    const meta = useAssetMeta(asset),
        icon = meta?.toml_info?.image || meta?.toml_info?.orgLogo
    if (asset.toString() === 'XLM') return <span className="asset-icon icon icon-stellar"/>
    if (icon) return <span style={{backgroundImage: `url('${icon}')`}} className="asset-icon"/>
    return <span className="asset-icon icon icon-dot-circled"/>
}

function AssetIssuer({asset}) {
    let meta = useAssetMeta(asset)
    asset = AssetDescriptor.parse(asset)
    if (asset.isNative) {
        meta = {domain: 'stellar.org'}
    }
    return <span className="asset-issuer">
        <i className="icon icon-link"/>
        {meta?.domain ?
            <>{meta.domain}</> :
            <><AccountAddress account={asset.issuer} link={false} chars={8} icon={false}/></>}
    </span>
}

function BalanceAmount({amount}) {
    const [integer, fractional = ''] = formatCurrency(amount).split('.')
    return <div className="asset-amount">
        {integer}<span className="dimmed text-small">.{fractional.padEnd(7, '0')}</span>
    </div>
}

function AccountPoolBalanceView({balance, asset}) {
    const [poolInfo, setPoolInfo] = useState(),
        network = useStellarNetwork()
    useEffect(() => {
        let unloaded = false
        resolvePoolParams(network, asset.toString(), true)
            .then(res => {
                if (unloaded) return
                setPoolInfo(res)
            })
        return () => {
            unloaded = true
        }
    })

    if (!poolInfo) return <div className="loader"/>

    const stake = poolInfo.total_shares,
        reserves = poolInfo.reserves.map(r => r.amount),
        assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset)),
        stakeValue = estimateLiquidityPoolStakeValue(balance.balance, reserves, stake) || ['0', '0']

    return <div className="account-balance liquidity-pool">
        <div style={{width: '3em'}}>
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
}

function AccountAssetBalanceView({balance, asset}) {
    return <div className="account-balance">
        <AssetIcon asset={asset}/>
        <div className="text-left">
            <div className="asset-code">{asset.code}</div>
            <AssetIssuer asset={asset}/>
        </div>
        <div>
            <BalanceAmount amount={balance.balance}/>
        </div>
    </div>
}

export default function AccountBalanceView({balance, asset, children}) {
    asset = AssetDescriptor.parse(asset)
    return <>
        {asset.poolId ?
            <AccountPoolBalanceView asset={asset} balance={balance}/> :
            <AccountAssetBalanceView asset={asset} balance={balance}/>}
        {children}
        <hr className="flare"/>
    </>
}