import React, {useState} from 'react'
import isEqual from 'react-fast-compare'
import PropTypes from 'prop-types'
import intent, {intentInterface} from '@albedo-link/intent'
import allDemos from '../demo-intent-default-params'
import demoNav from '../demo-nav-model'
import DemoIntentRequestParametersView from './demo-intent-request-parameters-view'
import DemoIntentResultsView from './demo-intent-results-view'
import DemoIntentExampleView from './demo-intent-example-view'
import Tabs from '../../components/tabs'
import {useDependantState} from '../../../state/state-hooks'
import {generateInvocation} from '../demo-code-generator'

intent.frontendUrl = location.origin

function formatOutput(output) {
    return JSON.stringify(output, null, '  ')
}

function CodeExampleInfoView({children}) {
    return <div className="dimmed text-small">
        <i className="fa fa-info-circle"/> {children}
    </div>
}

const tabs = [
    {
        name: 'script',
        title: 'Javascript code',
        render: () => <CodeExampleInfoView>
            Fully customizable integration for online shops, payment gateways, service providers.
            The best option for client-side JS frameworks like React or Angular. Requires Albedo intent library.
        </CodeExampleInfoView>
    },
    {
        name: 'button',
        title: 'Button script',
        render: () => <CodeExampleInfoView>
            This code can be embedded into any webpage - no need to
            include Stellar SDK or write any code. It will be automatically substituted with a payment
            button upon loading. The weapon of choice for simple integration cases.
        </CodeExampleInfoView>
    },
    {
        name: 'link', title: 'Link web+stellar',
        render: () => <CodeExampleInfoView>
            <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md"
               target="_blank">SEP0007</a>-formatted payment request link compatible with some other Stellar
            wallets. Supports a subset of Albedo features. Doesn't require Stellar SDK or Albedo intent script.
        </CodeExampleInfoView>
    }
]

function DemoIntentBlockView({intent}) {
    const [selectedTab, setSelectedTab] = useState('script')
    const [state, setStateInternal] = useDependantState(() => {
        const defaultParams = allDemos[intent],
            {title, description, params: intentParams, returns, implicitFlow} = intentInterface[intent]

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

        return {
            allParams,
            intentParams,
            returns,
            title,
            description,
            implicitFlow,
            inProgress: false,
            result: null,
            error: false
        }
    }, [intent])

    function setParam(param, value) {
        setStateInternal(prevState => {
            const newParams = {...state.allParams, [param]: value}
            return isEqual(newParams, prevState.allParams) ? prevState : {...prevState, allParams: newParams}
        })
    }

    function setState(newState) {
        setStateInternal(prevState => {
            const newParams = {...prevState, ...newState}
            return isEqual(newParams, prevState) ? prevState : newParams
        })
    }

    function exec() {
        setState({inProgress: true})
        try {
            //invoke dynamically
            new Function('albedo', `return ${generateInvocation(intent, allParams)}`)(intent)
                .then((res) => setState({
                    result: formatOutput(res),
                    inProgress: false,
                    error: false
                }))
                .catch(err => setState({
                    result: err instanceof Error ? err.stack : formatOutput(err),
                    inProgress: false,
                    error: true
                }))
        } catch (e) {
            setState({
                result: e instanceof Error ? e.stack : formatOutput(e),
                inProgress: false,
                error: true
            })
        }
    }

    const {title, description, returns, allParams, implicitFlow, inProgress} = state

    return <div className="intent-block" style={{paddingBottom: '2em'}}>
        <h2 id={intent}>{title} - <code>{intent}</code></h2>
        <div className="intent-description">{description}</div>
        <Tabs tabs={tabs} selectedTab={selectedTab} onChange={tab => setSelectedTab(tab)}/>
        <div className="space">
            <b>Parameters</b>
            <DemoIntentRequestParametersView onChange={(param, value) => setParam(param, value)}
                                             {...state}/>
        </div>
        {!!implicitFlow && <p className="dimmed text-small space">
            This intent can be executed implicitly if{' '}
            <a href="#implicit_flow" onClick={() => demoNav.section = 'implicit_flow'}>implicit flow</a>{' '}
            permissions were granted and "pubkey" parameter set.
        </p>}
        <DemoIntentExampleView returns={returns} invocation={generateInvocation(intent, allParams)}/>
        <div className="space">
            <button className="button request" style={{minWidth: '40%'}} disabled={inProgress} onClick={exec}>
                Try it
            </button>
        </div>
        <DemoIntentResultsView {...state}/>
    </div>
}

export default DemoIntentBlockView