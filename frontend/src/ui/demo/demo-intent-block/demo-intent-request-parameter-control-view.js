import React from 'react'
import cn from 'classnames'
import {useAutoFocusRef} from '@stellar-expert/ui-framework'

function TextParamControl({value, description, param, inProgress, onChange}) {
    return <>
        <label>
            <code>{param}</code>{description}
        </label>
        <input type="text" value={value} disabled={inProgress} onChange={e => onChange(param, e.target.value)} className="text-monospace"/>
    </>
}

function CheckboxParamControl({value, description, param, inProgress, onChange}) {
    return <label>
        <input type="checkbox" checked={value} disabled={inProgress}
               onChange={e => onChange(param, e.target.checked)}/>{' '}
        <code>{param}</code>{description}
    </label>
}

function isCustomNetwork(network) {
    return !['testnet', 'public'].includes(network)
}

function NetworkParamControl({value, description, param, inProgress, onChange}) {
    const resolvedNetworkType = isCustomNetwork(value) ? 'custom' : value

    function setNetwork(e) {
        const {value} = e.target
        onChange(param, isCustomNetwork(value) ? '' : value)
    }

    return <>
        <label>
            <code>{param}</code>{description}
        </label>
        <select value={resolvedNetworkType} disabled={inProgress} onChange={setNetwork}>
            <option value="public">Stellar public network</option>
            <option value="testnet">Test network</option>
            <option value="custom">Custom network</option>
        </select>
        {resolvedNetworkType === 'custom' &&
            <input type="text" value={value} disabled={inProgress} placeholder="Custom Stellar network passphrase"
                   onChange={e => onChange(param, e.target.value)} ref={useAutoFocusRef}/>}
    </>
}

export default function DemoIntentRequestParameterControlView({param, value, intentParams, inProgress, nested, onChange}) {
    let {required, type, description} = intentParams[param] || {}
    if (!description) return null
    if (nested && ['network', 'pubkey'].includes(param)) return null
    description = ' - ' + description
    if (!required) {
        description = ' (optional)' + description
    }
    let control
    if (param === 'submit' || type === 'boolean') {
        control = CheckboxParamControl
    } else if (param === 'network') {
        control = NetworkParamControl
    } else {
        control = TextParamControl
    }

    return React.createElement(control, {value, description, param, inProgress, onChange})
}