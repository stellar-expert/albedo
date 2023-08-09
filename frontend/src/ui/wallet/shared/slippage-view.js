import React, {useCallback, useState} from 'react'
import {Slider} from '@stellar-expert/ui-framework'
import SliderInputLayoutView from '../../components/slider-input-layout-view'

export default function SlippageView({defaultValue = 0.5, max = 10, step = 0.5, title, onChange}) {
    const [slippageValue, setSlippageValue] = useState(defaultValue)
    const validate = useCallback(v => {
        if (typeof v === 'string') {
            v = parseFloat(v.replace(/[^\d.]/g, '')) || 0
            if (v >= 99) {
                v = 99
            }
        }
        return v
    }, [])

    const changeSlippage = useCallback(v => {
        setSlippageValue(v)
    }, [])

    return <div className="space">
        <SliderInputLayoutView title={title} validate={validate} valueInput={slippageValue} onChangeInput={onChange} suffix='%'>
            <Slider value={defaultValue} max={max} step={step} onChange={changeSlippage}/>
        </SliderInputLayoutView>
    </div>
    /*<InfoTooltip>
                Controls the amount of price slippage (the maximum % of price movement) you are willing to accept
                for a trade. If the actual price slippage during the order execution exceeds this threshold, the
                trade will fail. The calculated amounts of tokens being bought/sold include the slippage. However,
                effective exchange price is almost always better than the projected price with the slippage since
                the price quoting mechanism already takes into account available on-chain liquidity.
            </InfoTooltip>*/
}