import React, {useCallback, useEffect, useState} from 'react'
import {debounce} from 'throttle-debounce'
import {formatWithPrecision} from '@stellar-expert/formatter'
import {Slider} from '@stellar-expert/ui-framework'
import {estimateFee} from '../../../util/fee-estimator'
import SliderInputLayoutView from '../../components/slider-input-layout-view'

const stroop = 0.0000001
const minFee = 0.00001 //min 100 stroops
const confidenceValues = ['low', 'normal', 'high']

function checkValueFee(v) {
    if (v <= minFee)
        return minFee
    return v || minFee
}

const debouncedUpdateFee = debounce(400, (callback, value) => callback(value))

export default function FeeView({transfer}) {
    const [editorVisible, setEditorVisible] = useState(false)
    const [fee, setFee] = useState(formatWithPrecision((transfer?.fee * stroop)))

    const setEstimateFee = useCallback(() => {
        estimateFee(transfer.network)
            .then(estimatedFee => {
                setFee(formatWithPrecision(estimatedFee * stroop))
            })
    }, [transfer])

    useEffect(() => {
        setEstimateFee()
        const updateEstimateFee = setInterval(setEstimateFee, 5000) //check fee every 5 seconds
        if (editorVisible) {
            clearInterval(updateEstimateFee)
        }
        return () => clearInterval(updateEstimateFee)
    }, [transfer, setEstimateFee, editorVisible])

    const validate = useCallback(v => {
        if (typeof v === 'string') {
            v = checkValueFee(parseFloat(v.replace(/(^[0-9]{0,1}\.?[0-9]{8,})/i, '')) || 0)
        }
        return v
    }, [])

    //change the fee using the input
    const changeFee = useCallback(v => {
        setFee(v)
        debouncedUpdateFee(v => transfer.setFee(v), formatWithPrecision(v / stroop, 7, ''))
    }, [transfer])

    //change the fee using the slider
    const changeFeeConfidence = useCallback(async v => {
        const index = v || 0
        const feeValue = await estimateFee(transfer.network, confidenceValues[index]) * stroop || minFee
        setFee(formatWithPrecision(feeValue))
        debouncedUpdateFee(v => transfer.setFee(v), confidenceValues[index])
    }, [transfer])

    const showEditor = useCallback(() => setEditorVisible(true), [])

    if (!editorVisible)
        return <div className="space text-right">
            <a className="condensed text-tiny dimmed" onClick={showEditor}>Network fee: {fee} XLM</a>
        </div>

    return <SliderInputLayoutView title="Network fee" validate={validate} valueInput={fee} onChangeInput={changeFee}
                                  suffix={<i className="icon icon-stellar"/>}>
        <Slider value={1} max={2} step={1} categroies={confidenceValues} onChange={changeFeeConfidence}/>
    </SliderInputLayoutView>
}