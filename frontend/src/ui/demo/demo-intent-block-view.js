import React, {Component} from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import allDemos from './all-demos'
import Highlight from '../components/highlight'
import intent, {intentInterface} from 'albedo-intent'
import demoNav from './demo-nav-model'
import {CopyToClipboard} from 'react-copy-to-clipboard'

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
            {example, params: demoParams, description} = allDemos[intent],
            {title, params: intentParams, returns, implicitFlow} = intentInterface[intent]

        const allParams = {}
        for (let key in intentParams) {
            if (intentParams.hasOwnProperty(key)) {
                allParams[key] = ''
                if (key === 'network') {
                    allParams[key] = 'testnet'
                }
            }
        }
        for (let key in demoParams)
            if (demoParams.hasOwnProperty(key) && demoParams[key].default) {
                allParams[key] = demoParams[key].default
            }

        return {
            allParams,
            intentParams,
            demoParams,
            returns,
            title,
            description,
            example,
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
                const val = allParams[key].trim()
                if (val) {
                    args.push(`    ${key}: '${val.replace('\'', '\\\'')}'`)
                }
            }

        const formattedArgs = !args.length ? '' : `{
${args.join(',\n')}
}`

        const method = intent.replace(/_([a-z])/g, g => g[1].toUpperCase())
        return `albedo.${method}(${formattedArgs})`
    }

    generateExample() {
        const {returns} = this.state

        const formattedOutput = returns.map(returnParam => 'res.' + returnParam).join(', ')

        return `${this.generateInvocation()}
    .then(res => console.log(${formattedOutput}))`
    }

    renderParameters() {
        const {allParams, intentParams, demoParams, inProgress} = this.state,
            keys = Object.keys(allParams)
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
            //temporary disabled "submit" and "callback" function
            if (param === 'submit' || param === 'callback') return
            return <div key={param}>
                <label><code>{param}</code>{descr}</label>
                <input type="text" value={allParams[param]} disabled={inProgress}
                       onChange={e => this.setParam(param, e.target.value)}/>
            </div>
        })}
        </>
    }

    renderResult() {
        const {result, error} = this.state
        return result && <Highlight className={cn('result', {error})} lang="json">{result}</Highlight>
    }

    render() {
        const {intent} = this.props,
            {title, description, implicitFlow, inProgress} = this.state,
            example = this.generateExample()

        return <div className="intent-block" style={{paddingBottom: '2em'}}>
            <h2 id={intent}>{title} - <code>{intent}</code></h2>
            <div className="intent-description">{description}</div>
            <div className="space">
                <b>Parameters</b>
                {this.renderParameters()}
            </div>
            {!!implicitFlow && <div className="dimmed text-small space">
                This intent can be executed implicitly if <a href="#implicit_flow"
                                                             onClick={() => demoNav.section = 'implicit_flow'}>implicit
                flow</a> permissions were granted and "pubkey" parameter set.
            </div>}
            <div className="space">
                <b>Code</b> <CopyToClipboard text={example}>
                <a href="#" className="fa fa-copy active-icon" title="Copy script to clipboard"/>
            </CopyToClipboard>
                <Highlight>{example}</Highlight>
            </div>
            <div className="space">
                <button className="button request" style={{minWidth: '40%'}} disabled={inProgress}
                        onClick={() => this.exec()}>Try it
                </button>
            </div>
            {this.renderResult()}
        </div>
    }
}

export default IntentBlock