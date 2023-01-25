import React, {useState} from 'react'
import {Slider} from '@stellar-expert/ui-framework'

export default function SlippageView({defaultValue = 0.5, max = 10, step = 0.5, title, onChange}) {
    const [slippage, setSlippage] = useState(defaultValue)

    return <div className="space">
        <Slider value={slippage} max={max} step={step} title={title} onChange={v => {
            setSlippage(v)
            onChange(v)
        }}/>
    </div>
    /*<InfoTooltip>
                Controls the amount of price slippage (the maximum % of price movement) you are willing to accept
                for a trade. If the actual price slippage during the order execution exceeds this threshold, the
                trade will fail. The calculated amounts of tokens being bought/sold include the slippage. However,
                effective exchange price is almost always better than the projected price with the slippage since
                the price quoting mechanism already takes into account available on-chain liquidity.
            </InfoTooltip>*/
}