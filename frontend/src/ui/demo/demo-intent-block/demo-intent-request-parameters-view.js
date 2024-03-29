import React from 'react'
import isEqual from 'react-fast-compare'
import {intentInterface} from '@albedo-link/intent'
import {useDependantState} from '@stellar-expert/ui-framework'
import allDemos from '../demo-intent-default-params'
import DemoIntentRequestParameterControlView from './demo-intent-request-parameter-control-view'

export default function DemoIntentRequestParametersView({intent, inProgress, onChange, nested}) {
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
        {keys.map(param =>
            <DemoIntentRequestParameterControlView key={param} param={param} value={allParams[param]} intentParams={intentParams}
                                                   inProgress={inProgress} nested={nested} onChange={updateParam}/>)}
        {!nested && !!implicitFlow && <p className="dimmed text-small">
            <i className="icon-info"/> This intent can be executed implicitly if{' '}
            <a href="/playground?section=implicit_flow">implicit flow</a>{' '}
            permissions were granted and "pubkey" parameter set.
        </p>}
    </>
}