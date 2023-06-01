import React, {useState} from 'react'
import {debounce} from 'throttle-debounce'
import './fee-view.scss'

const throttledUpdateFee = debounce(400, (callback, value) => callback(value))

export default function FeeView({defaultValue = 0.5, onChange, ...otherProps}) {
    const [fee, setFee] = useState(defaultValue)
    function change(e) {
        let v = e.target.value
        if (typeof v === 'string') {
            v = parseFloat(v.replace(/(^[0-9]{0,1}\.?[0-9]{8,})/i, '')) || 0
            if (v <= 0.00001) {
                v = 0.00001
            }
        }
        setFee(v)
        throttledUpdateFee(onChange, v)
    }

    return <div className="transaction-fee space dual-layout dimmed text-small" {...otherProps}>
        <div>Transaction fee</div>
        <div>
            <input type="text" value={fee} onChange={change}/>&nbsp;XLM
        </div>
    </div>
}