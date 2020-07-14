import React, {Component} from 'react'
import PropTypes from 'prop-types'
import intent, {intentInterface} from 'albedo-intent'
import allDemos from '../demo-intent-default-params'
import demoNav from '../demo-nav-model'
import DemoIntentRequestParametersView from './demo-intent-request-parameters-view'
import DemoIntentResultsView from './demo-intent-results-view'
import DemoIntentExampleView from './demo-intent-example-view'

intent.frontendUrl = location.origin

function formatOutput(output) {
    return JSON.stringify(output, null, '  ')
}

class IntentBlock extends Component {
    constructor(props) {
        super(props)
        this.state = this.getDefaultParams(props)
    }

    static propTypes = {
        intent: PropTypes.string.isRequired
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.getDefaultParams(nextProps))
        this.forceUpdate()
    }

    getDefaultParams(props) {
        const {intent} = props,
            defaultParams = allDemos[intent],
            {title, description, params: intentParams, returns, implicitFlow} = intentInterface[intent]

        const allParams = {}
        for (let key in intentParams) {
            if (intentParams.hasOwnProperty(key)) {
                allParams[key] = ''
                if (key === 'network') {
                    allParams[key] = 'testnet'
                }
            }
        }
        for (let key in (defaultParams||{}))
            if (defaultParams.hasOwnProperty(key)) {
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
    }

    exec() {
        this.setState({inProgress: true})
        try {
            //invoke dynamically
            new Function('albedo', `return ${this.generateInvocation()}`)(intent)
                .then((res) => this.setState({
                    result: formatOutput(res),
                    inProgress: false,
                    error: false
                }))
                .catch(err => this.setState({
                    result: err instanceof Error ? err.stack : formatOutput(err),
                    inProgress: false,
                    error: true
                }))
        } catch (e) {
            this.setState({
                result: e instanceof Error ? e.stack : formatOutput(e),
                inProgress: false,
                error: true
            })
        }
    }

    setParam(param, value) {
        const allParams = Object.assign({},
            this.state.allParams,
            {[param]: value})
        this.setState({allParams})
    }

    generateInvocation() {
        const {allParams} = this.state,
            {intent} = this.props,
            args = []

        for (let key in allParams)
            if (allParams.hasOwnProperty(key)) {
                let val = allParams[key]
                if (typeof val === 'string') {
                    if (!val) {
                        val = undefined
                    } else {
                        val = `'${val.trim().replace('\'', '\\\'')}'`
                    }
                }
                if (val) {
                    args.push(`    ${key}: ${val}`)
                }
            }

        const formattedArgs = !args.length ? '' : `{
${args.join(',\n')}
}`

        const method = intent.replace(/_([a-z])/g, g => g[1].toUpperCase())
        return `albedo.${method}(${formattedArgs})`
    }

    render() {
        const {intent} = this.props,
            {title, description, implicitFlow, inProgress} = this.state

        return <div className="intent-block" style={{paddingBottom: '2em'}}>
            <h2 id={intent}>{title} - <code>{intent}</code></h2>
            <div className="intent-description">{description}</div>
            <div className="space">
                <b>Parameters</b>
                <DemoIntentRequestParametersView onChange={(param, value) => this.setParam(param, value)}
                                                 {...this.state}/>
            </div>
            {!!implicitFlow && <p className="dimmed text-small space">
                This intent can be executed implicitly if{' '}
                <a href="#implicit_flow" onClick={() => demoNav.section = 'implicit_flow'}>implicit flow</a>{' '}
                permissions were granted and "pubkey" parameter set.
            </p>}
            <DemoIntentExampleView returns={this.state.returns} invocation={this.generateInvocation()}/>
            <div className="space">
                <button className="button request" style={{minWidth: '40%'}} disabled={inProgress}
                        onClick={() => this.exec()}>Try it
                </button>
            </div>
            <DemoIntentResultsView {...this.state}/>
        </div>
    }
}

export default IntentBlock