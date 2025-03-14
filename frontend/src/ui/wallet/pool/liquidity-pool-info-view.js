import React from 'react'
import {Amount} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {formatPrice, formatWithAutoPrecision, fromStroops, toStroops} from '@stellar-expert/formatter'
import {estimateLiquidityPoolStakeValue} from '@stellar-expert/liquidity-pool-utils'

export default function LiquidityPoolInfoView({poolInfo, stake}) {
    /*if (assets[0].toString() === assets[1].toString())
        return <div>Invalid asset pair – select two different assets</div>*/
    if (poolInfo === undefined)
        return <div className="loader"/>
    stake = BigInt(stake)
    const assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset)),
        reserves = poolInfo.reserves.map(r => r.amount),
        price = parseFloat(reserves[0]) / parseFloat(reserves[1]),
        estimatedValue = stake > 0n && estimateLiquidityPoolStakeValue(fromStroops(stake), poolInfo.reserves.map(r => r.amount), poolInfo.total_shares)
    return <div className="segment text-small space">
        <h4>POOL INFO</h4>
        <div>
            <div className="dimmed">Total liquidity locked:</div>
            <div>
                &emsp;<Amount amount={reserves[0]} asset={assets[0]}/>
            </div>
            <div>
                &emsp;<Amount amount={reserves[1]} asset={assets[1]}/>
            </div>
        </div>
        {!!price && <div>
            <span className="dimmed">Price: </span>
            {formatPrice(price)} {assets[0].code}/{assets[1].code}
        </div>}
        <div>
            <span className="dimmed">Participants: </span>
            {poolInfo.total_trustlines}
        </div>
        <div>
            <span className="dimmed">Fee rate: </span>
            {poolInfo.fee_bp / 100}%
        </div>
        {(!!estimatedValue || stake > 0n) && <>
            <hr className="flare"/>
            <h4>Your current stake</h4>
            <div>
                {stake.toString()} <span className="dimmed">shares</span>
            </div>
            <div className="dimmed condensed">
                &emsp;({formatWithAutoPrecision(100n * stake / toStroops(poolInfo.total_shares))}% of the pool liquidity)
            </div>
            {!!estimatedValue && <>
                <div>
                    &emsp;<Amount amount={estimatedValue[0]} asset={assets[0]}/>
                </div>
                <div>
                    &emsp;<Amount amount={estimatedValue[1]} asset={assets[1]}/>
                </div>
            </>}
        </>}
    </div>
}