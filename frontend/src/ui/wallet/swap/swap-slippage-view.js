import React, {useState} from 'react'
import {throttle} from 'throttle-debounce'
import {InfoTooltip} from '@stellar-expert/ui-framework'
import './swap-slippage.scss'

const throttledUpdateSlippage = throttle(1000, (callback, value) => callback(value))

export default function SwapSlippageView({defaultValue = 0.5, onChange}) {
    const [slippage, setSlippage] = useState(defaultValue)

    function change(e) {
        let v = e.target.value
        if (typeof v === 'string') {
            v = parseFloat(v.replace(/[^\d.]/g, '')) || 0
            if (v >= 100) {
                v = 1
            }
        }
        setSlippage(v)
        throttledUpdateSlippage(onChange, v)
    }

    return <div className="swap-slippage dual-layout dimmed text-small">
        <div>
            Slippage tolerance {/*<InfoTooltip>
            Controls the amount of price slippage (the maximum % of price movement) you are willing to accept
            for a trade. If the actual price slippage during the order execution exceeds this threshold, the
            trade will fail. The calculated amounts of tokens being bought/sold include the slippage. However,
            effective exchange price is almost always better than the projected price with the slippage since
            the price quoting mechanism already takes into account available on-chain liquidity.
        </InfoTooltip>*/}</div>
        <div>
            <input type="range" min={0} max={10} step={0.5} value={slippage} onChange={change}/>
        </div>
        <div>
            <input type="text" value={slippage} onChange={change}/>%
        </div>
    </div>
}