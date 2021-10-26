import React from 'react'
import {AssetDescriptor, Amount, formatWithAutoPrecision} from '@stellar-expert/ui-framework'

export default function LiquidityPoolInfoView({settings, poolInfo}) {
    if (settings.asset[0] === settings.asset[1])
        return <div>Invalid asset pair – select two different assets</div>
    if (!poolInfo)
        return <div>This liquidity pool doesn't exist. You can deposit tokens to create the pool.</div>
    const reserves = poolInfo.reserves.map(r => r.amount),
        assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset)),
        price = parseFloat(reserves[0]) / parseFloat(reserves[1]),
        assetsRatio = `${assets[0].code}/${assets[1].code}`
    return <div>
        <div>
            <span className="dimmed">Current price: </span>
            {formatWithAutoPrecision(price)} {assetsRatio}
        </div>
        <div>
            <span className="dimmed">Liquidity providers: </span>
             {poolInfo.total_trustlines}
        </div>
        <div>
            <div className="dimmed">Pool liquidity: </div>
            <div>
                &emsp;<Amount amount={reserves[0]} asset={assets[0]} icon={false} round/>
            </div>
            <div>
                &emsp;<Amount amount={reserves[1]} asset={assets[1]} icon={false} round/>
            </div>
        </div>
    </div>
}