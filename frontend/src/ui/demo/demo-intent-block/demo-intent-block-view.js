import React, {useState} from 'react'
import PropTypes from 'prop-types'
import albedo, {intentInterface} from '@albedo-link/intent'
import {useLocation} from 'react-router'
import DemoIntentRequestParametersView from './demo-intent-request-parameters-view'
import DemoIntentResultsView from './demo-intent-results-view'
import DemoIntentExampleView from './demo-intent-example-view'
import Tabs from '../../components/tabs'
import {generateInvocation} from '../demo-code-generator'
import {useDependantState} from '../../../state/state-hooks'
import {parseQuery} from '../../../util/url-utils'
import DemoHtmlPreviewView from './demo-html-preview-view'

albedo.frontendUrl = location.origin

function formatOutput(output) {
    return JSON.stringify(output, null, '  ')
}

function CodeExampleInfoView({children}) {
    return <p className="dimmed text-small">
        <i className="fa fa-info-circle"/> {children}
    </p>
}

function getTabs(intent) {
    const res = [{
        name: 'script',
        title: 'Javascript code',
        render: () => <CodeExampleInfoView>
            Fully customizable integration for online shops, payment gateways, service providers.
            The best option for client-side JS frameworks like React or Angular. Requires Albedo intent library.
        </CodeExampleInfoView>
    }]

    if (['public_key', 'sign_message', 'tx', 'pay', 'trust', 'exchange'].includes(intent)) {
        res.push({
            name: 'button',
            title: 'Button script',
            render: () => <CodeExampleInfoView>
                This code can be embedded into any webpage - no need to include Stellar SDK or write custom code.
                It will be automatically substituted with a payment button upon loading.
                The weapon of choice for simple integration cases.
            </CodeExampleInfoView>
        })
    }

    if (['tx', 'pay'].includes(intent)) {
        res.push({
            name: 'link', title: 'Link web+stellar',
            render: () => <CodeExampleInfoView>
                <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md"
                   target="_blank">SEP0007</a>-formatted payment request link compatible with some other Stellar
                wallets.
                Supports a subset of Albedo features. Doesn't require Stellar SDK or Albedo intent script.
            </CodeExampleInfoView>
        })
    }
    return res
}

function DemoIntentBlockView({intent}) {
    const intentDefinition = intentInterface[intent]
    if (!intentDefinition) return <div className="space">
        <div className="text-center error">
            Unknown intent: "{intent}"
        </div>
    </div>

    const location = useLocation()

    const {title, description} = intentDefinition

    const [selectedTab, setSelectedTab] = useDependantState(() => {
        const {output} = parseQuery(location.search)
        return output || 'script'
    }, [intent])

    const [allParams, setAllParams] = useDependantState(() => [], [intent]),
        [inProgress, setInProgress] = useDependantState(() => false, [intent]),
        [result, setResult] = useDependantState(() => null, [intent]),
        [error, setError] = useDependantState(() => false, [intent])

    function selectTab(tab) {
        setSelectedTab(tab)
        __history.replace(`/playground?section=${intent}&output=${tab}`)
    }

    function exec() {
        setInProgress(true)
        //invoke dynamically
        new Promise(resolve => {
            const res = new Function('albedo', `return ${generateInvocation(intent, allParams)}`)(albedo)
            resolve(res)
        })
            .then(res => {
                setResult(formatOutput(res))
                setError(false)
                setInProgress(false)
            })
            .catch(e => {
                setResult(e instanceof Error ? e.stack : formatOutput(e))
                setError(true)
                setInProgress(false)
            })
    }

    return <div className="intent-block" style={{paddingBottom: '2em'}}>
        <h2 id={intent}>{title} - <code>{intent}</code></h2>
        <div className="intent-description">{description}</div>
        <div className="space">
            <b>Parameters</b>
            <DemoIntentRequestParametersView {...{intent, inProgress, selectedTab}}
                                             onChange={params => setAllParams(params)}/>
        </div>
        <Tabs tabs={getTabs(intent)} selectedTab={selectedTab} onChange={tab => selectTab(tab)}/>
        <DemoIntentExampleView {...{intent, allParams, selectedTab, inProgress}} onExec={exec}/>
        <DemoIntentResultsView {...{result, error}}/>
    </div>
}

export default DemoIntentBlockView