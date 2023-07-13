import React, {useCallback, useEffect, useState} from 'react'
import {debounce} from 'throttle-debounce'
import {estimateFee} from '../../../util/fee-estimator'
import './fee-view.scss'

function checkValueFee(v) {
    if (v <= 0.00001) return 0.00001
    return v || 0.00001
}

export default function FeeView({transfer, ...otherProps}) {
    const [showFee, setShowFee] = useState(false)
    const [fee, setFee] = useState(checkValueFee(transfer?.fee * 0.0000001))

    useEffect(() => {
        if (transfer.resetFee) estimateFee(transfer.network).then(estimatedFee => {
            transfer.setFee(estimatedFee)
            setFee(checkValueFee(estimatedFee * 0.0000001))
        })
    }, [transfer.network, transfer.resetFee])

    const change = useCallback(e => {
        let v = e.target.value
        if (typeof v === 'string') {
            v = checkValueFee(parseFloat(v.replace(/(^[0-9]{0,1}\.?[0-9]{8,})/i, '')) || 0)
        }
        setFee(v)
        debounce(400, transfer.setFee((v / 0.0000001).toFixed(0)))
    }, [transfer])

    if (!showFee) return <div className="space">
        <a className="text-small dimmed" onClick={() => setShowFee(true)}>Adjust transaction fee</a>
    </div>

    return <div className="transaction-fee space dual-layout dimmed text-small" {...otherProps}>
        <div>Transaction fee</div>
        <div>
            <input type="text" value={fee} onChange={change}/>&nbsp;XLM
        </div>
    </div>
}