import React from 'react'
import Bignumber from 'bignumber.js'
import {AccountAddress, AssetDescriptor, useAssetMeta, formatCurrency, estimateLiquidityPoolStakeValue} from '@stellar-expert/ui-framework'
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

function denominate(value) {
    return new Bignumber(value).div(10000000).toFixed(7)
}

export default function AccountBalanceView({balance, asset, children}) {
    asset = AssetDescriptor.parse(asset)
    const meta = useAssetMeta(asset)
    if (asset.poolId) {
        if (!meta) return <div className="loader"/>
        const stake = denominate(meta.total_shares || meta.shares),
            reserves = meta.assets.map(r => denominate(r.amount)),
            stakeValue = estimateLiquidityPoolStakeValue(balance.balance, reserves, stake)
        return <>
            <div className="account-balance liquidity-pool">
                <div style={{width: '3em'}}>
                    <div>
                        <AssetIcon asset={meta.assets[0].asset}/>
                    </div>
                    <div>
                        <AssetIcon asset={meta.assets[1].asset}/>
                    </div>
                </div>
                <div className="text-left">
                    <div>
                        <div className="asset-code">{AssetDescriptor.parse(meta.assets[0].asset).code}</div>
                        <AssetIssuer asset={meta.assets[0].asset}/>
                    </div>
                    <div>
                        <div className="asset-code">{AssetDescriptor.parse(meta.assets[1].asset).code}</div>
                        <AssetIssuer asset={meta.assets[1].asset}/>
                    </div>
                </div>
                <div>
                    <BalanceAmount amount={stakeValue[0]}/>
                    <BalanceAmount amount={stakeValue[1]}/>
                </div>
            </div>
            {
                children
            }
            <hr className="flare"/>
        </>
    }
    return <>
        <div className="account-balance">
            <AssetIcon asset={asset}/>
            <div className="text-left">
                <div className="asset-code">{asset.code}</div>
                <AssetIssuer asset={asset}/>
            </div>
            <div>
                <BalanceAmount amount={balance.balance}/>
            </div>
        </div>
        <hr className="flare"/>
    </>
}