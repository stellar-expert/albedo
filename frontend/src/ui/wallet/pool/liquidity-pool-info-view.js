import React from 'react'
import {
    AssetDescriptor,
    Amount,
    formatPrice,
    formatWithAutoPrecision,
    estimateLiquidityPoolStakeValue,
    adjustAmount
} from '@stellar-expert/ui-framework'

export default function LiquidityPoolInfoView({poolInfo, stake}) {
    /*if (assets[0].toString() === assets[1].toString())
        return <div>Invalid asset pair – select two different assets</div>*/
    if (poolInfo === undefined) return <div className="loader"/>
    const assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset)),
        reserves = poolInfo.reserves.map(r => r.amount),
        price = parseFloat(reserves[0]) / parseFloat(reserves[1]),
        assetsRatio = `${assets[0].code}/${assets[1].code}`,
        estimatedValue = estimateLiquidityPoolStakeValue(stake, poolInfo.reserves.map(r => r.amount), poolInfo.total_shares)
    return <div className="segment text-small">
        {!!estimatedValue && <div>
            <div className="dual-layout">
                <div className="dimmed">Your stake:</div>
                <div>
                    {adjustAmount(stake)} shares{' '}
                    <span className="dimmed">({formatWithAutoPrecision(100 * stake / poolInfo.total_shares)}%)</span>
                </div>
            </div>
            <div>
                &emsp;<Amount amount={estimatedValue[0]} asset={assets[0]}/>
            </div>
            <div>
                &emsp;<Amount amount={estimatedValue[1]} asset={assets[1]}/>
            </div>
        </div>}
        <div>
            <div className="dimmed">Total liquidity locked:</div>
            <div>
                &emsp;<Amount amount={reserves[0]} asset={assets[0]}/>
            </div>
            <div>
                &emsp;<Amount amount={reserves[1]} asset={assets[1]}/>
            </div>
        </div>
        <div className="dual-layout">
            <div className="dimmed">Current pool price:</div>
            <div>
                {formatPrice(price)} {assetsRatio}
            </div>
        </div>
        <div className="dual-layout">
            <div className="dimmed">Pool fee rate:</div>
            <div>{poolInfo.fee_bp / 100}%</div>
        </div>
        <div className="dual-layout">
            <div className="dimmed">Liquidity providers:</div>
            <div>{poolInfo.total_trustlines}</div>
        </div>
    </div>
}