import React from 'react'

export default function DemoIntentRequestParametersView({allParams, intentParams, inProgress, onChange}) {
    const keys = Object.keys(allParams)
    if (!keys.length) return <div className="dimmed">No parameters</div>
    return <>{keys.map(param => {
        let descr = ''
        if (!intentParams[param].required) {
            descr += ' (optional)'
        }
        if (intentParams[param]) {
            const paramDescription = intentParams[param].description
            if (paramDescription) {
                descr += ' - ' + paramDescription
            }
        }
        if (param === 'submit') return <div key={param}>
            <label><input type="checkbox" checked={allParams[param]} disabled={inProgress}
                          onChange={e => onChange(param, e.target.checked)}/> <code>{param}</code>{descr}</label>

        </div>

        function updateParam(param, value) {
            if (param === 'callback' && value && value.indexOf('url:') !== 0) {
                value = 'url:' + value
            }
            onChange(param, value)
        }

        return <div key={param}>
            <label><code>{param}</code>{descr}</label>
            <input type="text" value={allParams[param]} disabled={inProgress}
                   onChange={e => updateParam(param, e.target.value)}/>
        </div>
    })}
    </>
}