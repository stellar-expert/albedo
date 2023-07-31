import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Slider} from '@stellar-expert/ui-framework'
import {throttle} from 'throttle-debounce'
import './slider-value-view.scss'

export default function SliderValueView({title, suffix = '', max, step, categroies, validation, valueSlider, valueInput, onChangeSlider, onChangeInput}) {
    const [innerValueSlider, setInnerValueSlider] = useState(valueSlider)
    const [innerValueInput, setInnerValueInput] = useState(valueInput + suffix)
    const changeInput = useMemo(() => throttle(400, v => onChangeInput(v)), [onChangeInput])

    const changeValueSlider = useCallback(v => {
        setInnerValueSlider(v)
        setInnerValueInput(v + suffix)
        onChangeSlider(v)
    }, [onChangeSlider, suffix])

    const changeValueInput = useCallback(e => {
        const validatedValue = validation(e.target.value)
        const value = validatedValue + suffix
        setInnerValueInput(value)
        changeInput(validatedValue)
    }, [changeInput, validation, suffix])

    useEffect(() => {
        setInnerValueInput(valueInput + suffix)
    }, [valueInput, suffix])

    return <div className="slider-inline dual-layout dimmed text-small">
        <div>{title}</div>
        <div>
            <Slider value={innerValueSlider} max={max} step={step} categroies={categroies} onChange={changeValueSlider}/>
        </div>
        <div>
            <input type="text" className='condensed' value={innerValueInput}
                   onChange={changeValueInput}/>
        </div>
    </div>
}
