import React, {useEffect, useState} from 'react'
import cn from 'classnames'
import {AccountAddress, ElapsedTime, useAssetMeta, useStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {AssetDescriptor, parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import {getClaimableBalanceClaimStatus} from '@stellar-expert/claimable-balance-utils'
import {estimateLiquidityPoolStakeValue} from '@stellar-expert/liquidity-pool-utils'
import {formatWithPrecision} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'
import {prepareClaimBalanceTx, validateClaimClaimableBalance} from './claim-balance-tx-builder'
import './account-balance.scss'

function AssetIcon({asset, className}) {
    const meta = useAssetMeta(asset),
        icon = meta?.toml_info?.image || meta?.toml_info?.orgLogo
    if (asset.toString() === 'XLM') return <span className={cn('asset-icon icon icon-stellar', className)}/>
    if (icon) return <span style={{backgroundImage: `url('${icon}')`}} className={cn('asset-icon', className)}/>
    return <span className={cn('asset-icon icon icon-dot-circled', className)}/>
}

function AssetIssuer({asset}) {
    let meta = useAssetMeta(asset)
    asset = AssetDescriptor.parse(asset)
    if (asset.isNative) {
        meta = {domain: 'stellar.org'}
    }
    return <span className="asset-issuer text-tiny">
        <i className="icon icon-link"/>
        {meta?.domain ?
            <>{meta.domain}</> :
            <><AccountAddress account={asset.issuer} link={false} chars={8} icon={false}/></>}
    </span>
}

function BalanceAmount({amount}) {
    const [integer, fractional = ''] = formatWithPrecision(amount).split('.')
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
    }, [asset.toString()])

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

const claimableBalanceStatusIcons = {
    available: 'icon-ok',
    pending: 'icon-clock',
    expired: 'icon-back-in-time'
}

function AccountClaimableBalanceView({balance, asset, account}) {
    const claimant = balance.claimants.find(c => c.destination === account),
        status = claimant ? getClaimableBalanceClaimStatus(claimant) : 'unavailable',
        network = useStellarNetwork(),
        [claiming, setClaiming] = useState(false)

    function claimBalance() {
        const validationResult = validateClaimClaimableBalance(balance)
        if (validationResult) return alert(validationResult)
        if (!accountLedgerData.hasTrustline(asset) && !confirm(`You need to establish a trustline to before claiming this payment.
Would you like to create the trustline?
This action will temporarily lock 0.5 XLM on your account balance.`)) return
        setClaiming(true)
        prepareClaimBalanceTx(balance, network)
            .then(tx => {
                if (!tx) return
                return confirmTransaction(network, tx)
                    .then(() => navigation.navigate('/account'))
            })
            .finally(() => setClaiming(false))
    }

    return <>
        <div className="account-balance claimable">
        <span style={{width: 'auto'}}>
            <AssetIcon asset={asset}/>
            <span className="claimable-status">
                <span className={claimableBalanceStatusIcons[status] || 'icon-block'}/>
            </span>
        </span>
            <div className="text-left">
                <div className="asset-code">{AssetDescriptor.parse(asset).code}</div>
                <AssetIssuer asset={asset}/>
                <div className="dimmed text-tiny">
                    (sent <ElapsedTime className="dimmed" ts={new Date(balance.last_modified_time)} suffix=" ago"/>)
                </div>
            </div>
            <div>
                {claiming ?
                    <div className=" text-right">
                        <div style={{display: 'inline-block'}}>
                            <div className="loader"/>
                        </div>
                    </div> :
                    <>
                        <BalanceAmount amount={balance.amount}/>
                        <div className="text-right">
                            {status === 'available' ?
                                <a href="#" onClick={claimBalance}>claim tokens</a> :
                                <span className="dimmed">{status}</span>
                            }
                        </div>
                    </>}
            </div>
        </div>
    </>
}

function resolveType(balance, account) {
    const asset = parseAssetFromObject(balance)
    if (asset.poolId) return <AccountPoolBalanceView asset={asset} balance={balance}/>
    if (balance.claimants) return <AccountClaimableBalanceView asset={asset.toFQAN()} balance={balance} account={account}/>
    return <AccountAssetBalanceView asset={asset} balance={balance}/>
}

export default function AccountBalanceView({balance, account, children}) {
    return <>
        {resolveType(balance, account)}
        {children}
        <hr className="flare"/>
    </>
}