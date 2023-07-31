import React, {useCallback, useEffect, useState} from 'react'
import {debounce} from 'throttle-debounce'
import {estimateFee, confidenceValues, resolveConfidenceFee} from '../../../util/fee-estimator'
import SliderValueView from '../../components/slider-value-view'
import './fee-view.scss'

const stroop = 0.0000001
const minFee = 0.00001 //min 100 stroops

function checkValueFee(v) {
    if (v <= minFee) return minFee
    return v || minFee
}

function formatedValueFee(v) {
    return (v * stroop).toFixed(7).replace(/0*$/,"")
}

const debouncedUpdateFee = debounce(400, (callback, value) => callback(value))

export default function FeeView({transfer}) {
    const [editorVisible, setEditorVisible] = useState(false)
    const [fee, setFee] = useState(formatedValueFee((transfer?.fee)))

    const setEstimateFee = useCallback(() => {
        estimateFee(transfer.network).then(estimatedFee => {
            setFee(formatedValueFee(estimatedFee))
        })
    }, [transfer])

    useEffect(() => {
        setEstimateFee()
        const updateEstimateFee = setInterval(setEstimateFee, 5000) //check fee every 5 seconds
        if (editorVisible)
            clearInterval(updateEstimateFee)
        return () => clearInterval(updateEstimateFee)
    }, [transfer, setEstimateFee, editorVisible])

    const validation = useCallback(v => {
        if (typeof v === 'string') {
            v = checkValueFee(parseFloat(v.replace(/(^[0-9]{0,1}\.?[0-9]{8,})/i, '')) || 0)
        }
        return v
    }, [])

    //change the fee using the input
    const changeFee = useCallback(v => {
        setFee(v)
        debouncedUpdateFee(v => transfer.setFee(v), (v / stroop).toFixed(0))
    }, [transfer])

    //change the fee using the slider
    const changeFeeConfidence = useCallback(v => {
        const index = v || 0
        const feeValue = resolveConfidenceFee(confidenceValues[index]) || minFee
        setFee(formatedValueFee(feeValue))
        debouncedUpdateFee(v => transfer.setFee(v), confidenceValues[index])
    }, [transfer])

    const showEditor = useCallback(() => {
        setEditorVisible(true)
    }, [])

    if (!editorVisible)
        return <div className="space text-right">
            <a className="condensed text-tiny dimmed" onClick={showEditor}>network fee: {fee} XLM</a>
        </div>

    return <div className="space ">
        <SliderValueView title='Network fee' max={2} step={1} categroies={confidenceValues} validation={validation} suffix='XLM'
                         valueSlider={1} valueInput={fee} onChangeSlider={changeFeeConfidence} onChangeInput={changeFee}/>
    </div>
}