import React, {useCallback} from 'react'
import SliderValueView from '../../components/slider-value-view'

export default function SlippageView({defaultValue = 0.5, max = 10, step = 0.5, title, onChange}) {
    const validation = useCallback(v => {
        if (typeof v === 'string') {
            v = parseFloat(v.replace(/[^\d.]/g, '')) || 0
            if (v >= 99) {
                v = 99
            }
        }
        return v
    }, [])

    return <div className="space">
        <SliderValueView title={title} max={max} step={step} validation={validation} suffix='%'
                         valueSlider={defaultValue} valueInput={defaultValue} onChangeSlider={onChange} onChangeInput={onChange}/>
    </div>
    /*<InfoTooltip>
                Controls the amount of price slippage (the maximum % of price movement) you are willing to accept
                for a trade. If the actual price slippage during the order execution exceeds this threshold, the
                trade will fail. The calculated amounts of tokens being bought/sold include the slippage. However,
                effective exchange price is almost always better than the projected price with the slippage since
                the price quoting mechanism already takes into account available on-chain liquidity.
            </InfoTooltip>*/
}