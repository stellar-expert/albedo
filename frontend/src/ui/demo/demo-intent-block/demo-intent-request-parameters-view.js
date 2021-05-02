import React from 'react'
import isEqual from 'react-fast-compare'
import {intentInterface} from '@albedo-link/intent'
import {useDependantState} from '../../../state/state-hooks'
import allDemos from '../demo-intent-default-params'

export default function DemoIntentRequestParametersView({intent, inProgress, onChange}) {
    const {params: intentParams, implicitFlow} = intentInterface[intent]
    const [allParams, setAllParams] = useDependantState(() => {
        const defaultParams = allDemos[intent]

        const allParams = {}
        for (const key of Object.keys(intentParams)) {
            allParams[key] = ''
            if (key === 'network') {
                allParams[key] = 'testnet'
            }
        }
        for (const key of Object.keys((defaultParams || {}))) {
            allParams[key] = defaultParams[key]
        }
        setTimeout(() => onChange(allParams), 200)
        return allParams
    }, [intent])

    function updateParam(param, value) {
        if (param === 'callback' && value && value.indexOf('url:') !== 0) {
            value = 'url:' + value
        }
        setAllParams(params => {
            const newParams = {...params, [param]: value}
            if (isEqual(newParams, params)) return params
            onChange(newParams)
            return newParams
        })
    }

    const keys = Object.keys(allParams)
    if (!keys.length) return <div className="dimmed">No parameters</div>

    return <>
        {keys.map(param => {
            const {required, type, description} = intentParams[param] || {}
            if (!description) return null
            let descr = ' - ' + description
            if (!required) {
                descr = ' (optional)' + descr
            }
            if (param === 'submit' || type === 'boolean') return <div key={param}>
                <label>
                    <input type="checkbox" checked={allParams[param]} disabled={inProgress}
                           onChange={e => updateParam(param, e.target.checked)}/>{' '}
                    <code>{param}</code>{descr}
                </label>
            </div>

            return <div key={param}>
                <label>
                    <code>{param}</code>{descr}
                </label>
                <input type="text" value={allParams[param]} disabled={inProgress}
                       onChange={e => updateParam(param, e.target.value)}/>
            </div>
        })}
        {!!implicitFlow && <p className="dimmed text-small space">
            <i className="fa fa-info-circle"/> This intent can be executed implicitly if{' '}
            <a href="/playground?section=implicit_flow">implicit flow</a>{' '}
            permissions were granted and "pubkey" parameter set.
        </p>}
    </>
}