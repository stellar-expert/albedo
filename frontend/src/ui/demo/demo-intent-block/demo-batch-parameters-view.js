import React, {useEffect, useState} from 'react'
import DemoIntentRequestParametersView from './demo-intent-request-parameters-view'

export default function DemoBatchParametersView({intent, inProgress, onChange}) {
    const [allParams, setAllParams] = useState({intents: [{intent: 'tx', params: {}}]})

    function updateGeneralParams(params) {
        let newParams
        setAllParams(prevParams => {
            newParams = {...params, intents: prevParams.intents}
            return newParams
        })
    }

    function updateNestedIntents(updateCallback) {
        let newParams
        setAllParams(prevParams => {
            newParams = {...prevParams, intents: updateCallback(prevParams.intents)}
            return newParams
        })
    }

    function setParamsForNestedIntent(i, params) {
        if (params.network) {
            delete params.network
        }
        updateNestedIntents(existing => {
            const res = [...existing]
            res[i].params = params
            return res
        })
    }

    function addNestedIntent() {
        updateNestedIntents(existing => [...existing, {intent: 'tx', params: {}}])
    }

    function removeNestedIntent(i) {
        updateNestedIntents(existing => {
            const res = existing.slice()
            res.splice(i)
            if (!res.length) {
                res.push({intent: 'tx', params: {}})
            }
            return res
        })
    }

    useEffect(() => {
        setAllParams({intents: [{intent: 'tx', params: {}}]})
    }, [intent])

    useEffect(() => {
        const aggregatedIntentParams = Object.assign({
            ...allParams,
            intents: allParams.intents.map(g => ({intent: g.intent, ...g.params}))
        })
        onChange(aggregatedIntentParams)
    })

    return <div>
        <DemoIntentRequestParametersView {...{intent, inProgress}} onChange={updateGeneralParams}/>
        {allParams.intents.map(({intent}, i) => <div key={i + intent} className="block-indent segment">
            <h3>
                <div style={{float: 'right'}}>
                    <a href="#" onClick={() => removeNestedIntent(i)}><span className="icon icon-cancel"/></a>
                </div>
                Transaction {i + 1}
            </h3>
            <DemoIntentRequestParametersView intent={intent} inProgress={inProgress}
                                             onChange={params => setParamsForNestedIntent(i, params)} nested/>
        </div>)}
        <div className="micro-space">
            <a href="#" onClick={addNestedIntent}><span className="icon icon-plus"/> Add transaction to batch</a>
        </div>
    </div>
}