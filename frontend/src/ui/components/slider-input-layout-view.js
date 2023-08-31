import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {throttle} from 'throttle-debounce'
import './slider-input-layout-view.scss'

export default function SliderInputLayoutView({title, validate, valueInput, onChangeInput, suffix = '', children}) {
    const [innerValueInput, setInnerValueInput] = useState(valueInput + suffix)
    const changeInput = useMemo(() => throttle(400, v => onChangeInput(v)), [onChangeInput])

    const changeInputValue = useCallback(e => {
        const value = validate(e.target.value)
        setInnerValueInput(value)
        changeInput(value)
    }, [validate])

    useEffect(() => {
        setInnerValueInput(valueInput)
    }, [valueInput])

    return <div className="slider-inline space dual-layout dimmed text-small">
        <div className="condensed">{title}</div>
        <div>
            {children}
        </div>
        <div>
            <input type="text" className='condensed' value={innerValueInput} onChange={changeInputValue}/>
        </div>
        <div>
            {suffix}
        </div>
    </div>
}