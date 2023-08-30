import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {throttle} from 'throttle-debounce'
import './slider-input-layout-view.scss'

export default function SliderInputLayoutView({title, validate, valueInput, onChangeInput, suffix = '', children}) {
    const [innerValueInput, setInnerValueInput] = useState(valueInput + suffix)
    const changeInput = useMemo(() => throttle(400, v => onChangeInput(v)), [onChangeInput])

    const changeInputValue = useCallback(e => {
        const validatedValue = validate(e.target.value)
        const value = validatedValue + suffix
        setInnerValueInput(value)
        changeInput(validatedValue)
    }, [validate, suffix])

    useEffect(() => {
        setInnerValueInput(valueInput + suffix)
    }, [valueInput, suffix])

    return <div className="slider-inline dual-layout dimmed text-small">
        <div>{title}</div>
        <div>
            {children}
        </div>
        <div>
            <input type="text" className='condensed' value={innerValueInput} onChange={changeInputValue}/>
        </div>
    </div>
}