import React from 'react'
import Bignumber from 'bignumber.js'
import {
    AssetDescriptor,
    Amount,
    formatPrice,
    formatWithAutoPrecision,
    estimateLiquidityPoolStakeValue
} from '@stellar-expert/ui-framework'

export default function LiquidityPoolInfoView({poolInfo, stake}) {
    /*if (assets[0].toString() === assets[1].toString())
        return <div>Invalid asset pair – select two different assets</div>*/
    if (poolInfo === undefined) return <div className="loader"/>
    const assets = poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset)),
        reserves = poolInfo.reserves.map(r => r.amount),
        price = parseFloat(reserves[0]) / parseFloat(reserves[1]),
        total = new Bignumber(poolInfo.total_shares).mul(new Bignumber(10000000)).toString(),
        estimatedValue = estimateLiquidityPoolStakeValue(stake, poolInfo.reserves.map(r => r.amount), poolInfo.total_shares)
    return <div className="segment text-small">
        {(!!estimatedValue || stake !== undefined) && <div>
            <h4>Your current stake</h4>
            <div>
                {total} shares{' '}
                {stake > 0 &&
                <span className="dimmed condensed">({formatWithAutoPrecision(100 * stake / 10000000 / poolInfo.total_shares)}% of the pool liquidity)</span>}
            </div>
            {!!estimatedValue && <>
                <div>
                    &emsp;<Amount amount={estimatedValue[0]} asset={assets[0]} adjust/>
                </div>
                <div>
                    &emsp;<Amount amount={estimatedValue[1]} asset={assets[1]} adjust/>
                </div>
            </>}
        </div>}
        <h4>Pool info</h4>
        <div>
            <div className="dimmed">Total liquidity locked:</div>
            <div>
                &emsp;<Amount amount={reserves[0]} asset={assets[0]}/>
            </div>
            <div>
                &emsp;<Amount amount={reserves[1]} asset={assets[1]}/>
            </div>
        </div>
        <table>
            {!!price && <tr>
                <td className="dimmed">Current pool price:</td>
                <td>{formatPrice(price)} {assets[0].code}/{assets[1].code}</td>
            </tr>}
            <tr>
                <td className="dimmed">Liquidity providers:</td>
                <td>{poolInfo.total_trustlines}</td>
            </tr>
            <tr>
                <td className="dimmed">Pool fee rate:</td>
                <td>{poolInfo.fee_bp / 100}%</td>
            </tr>
        </table>
    </div>
}