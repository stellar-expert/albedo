import React from 'react'

export default function DemoIntentRequestParametersView({allParams, intentParams, demoParams, inProgress, onChange}) {
    const keys = Object.keys(allParams)
    if (!keys.length) return <div className="dimmed">No parameters</div>
    return <>{keys.map(param => {
        let descr = ''
        if (!intentParams[param].required) {
            descr += ' (optional)'
        }
        if (demoParams[param]) {
            const paramDescription = demoParams[param].description
            if (paramDescription) {
                descr += ' - ' + paramDescription
            }
        }
        //temporary disabled "callback" function
        if (param === 'callback') return
        if (param === 'submit') return <div key={param}>
            <label><input type="checkbox" checked={allParams[param]} disabled={inProgress}
                          onChange={e => onChange(param, e.target.checked)}/> <code>{param}</code>{descr}</label>

        </div>
        return <div key={param}>
            <label><code>{param}</code>{descr}</label>
            <input type="text" value={allParams[param]} disabled={inProgress}
                   onChange={e => onChange(param, e.target.value)}/>
        </div>
    })}
    </>
}