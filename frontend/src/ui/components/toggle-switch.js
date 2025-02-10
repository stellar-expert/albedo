import React, {useCallback} from 'react'
import './toggle-switch.scss'

export default function ToggleSwitch({checked, onChange}) {
    const onChangeCallback = useCallback((e) => onChange(e.target.checked), [onChange])
    return <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChangeCallback}/>
        <span className="slider"/>
    </label>
}