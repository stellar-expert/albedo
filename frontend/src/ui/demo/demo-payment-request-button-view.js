import React, {Component} from 'react'
import cn from 'classnames'
import Highlight from '../components/highlight'
import intent, {intentInterface} from '@albedo-link/intent'
import Dropdown from '../components/dropdown'
import {CopyToClipboard} from 'react-copy-to-clipboard'

function formatOutput(output) {
    return JSON.stringify(output, null, '  ')
}

const params = [
    {
        name: 'network',
        description: '"public" or "testnet"',
        defaultValue: 'testnet'
    },
    {
        name: 'destination',
        description: 'Merchant account'
    },
    {
        name: 'amount',
        description: 'Requested payment amount'
    },
    {
        name: 'asset-code',
        description: 'Asset code (skip for XLM)',
        optional: true
    },
    {
        name: 'asset-issuer',
        description: 'Issuer address',
        optional: true
    },
    {
        name: 'memo',
        description: 'Transaction memo',
        optional: true
    },

    {
        name: 'height',
        description: 'Button height (in pixels)',
        defaultValue: '50',
        optional: true
    },
    {
        name: 'width',
        description: 'Button width (in pixels)',
        defaultValue: '200',
        optional: true
    },
    {
        name: 'text',
        description: 'Button text prefix',
        defaultValue: 'Pay'
    },
    {
        name: 'class-name',
        description: 'CSS class name applied to a button',
        defaultValue: 'button',
        optional: true
    }
]

class DemoPaymentRequestButtonView extends Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState(props)
    }

    previewContainer = null

    componentWillReceiveProps(nextProps) {
        this.setState(this.getInitialState(nextProps))
        this.forceUpdate()
    }

    getInitialState(props) {
        const state = {
            format: 'button-script', //button-script, albedo-script, or link
            result: null,
            error: false,
            submit: 'true'
        }

        for (const {name, defaultValue} of params) {
            if (defaultValue) {
                state[name] = defaultValue
            }
        }

        return state
    }

    getPaymentIntentParams() {
        const {params: intentParams} = intentInterface.pay,
            invocationParams = {}
        //copy all filled in intent params
        for (const key of Object.keys(intentParams)) {
            const val = this.state[key]
            if (!val) continue
            invocationParams[key] = val.trim()
        }
        return invocationParams
    }

    exec() {
        this.setState({inProgress: true})
        try {
            //invoke payment request directly
            intent.pay(this.getPaymentIntentParams())
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
        this.setState({[param]: value})
    }

    getParamValue(name, descriptor) {
        if (!descriptor) {
            descriptor = params.find(p => p.name === name)
        }
        let value = this.state[name]
        if (!value && !descriptor.optional) {
            value = descriptor.defaultValue
        }
        return value
    }

    generateButtonScriptCode() {
        const allParams = params.map(param => {
            const value = this.getParamValue(param.name, param)
            if (!value) return null
            return `x-${param.name}="${value.trim().replace('"', '\"')}"`
        }).filter(v => !!v)
        return {
            script: `<script src="${location.origin}/albedo-payment-button.js" ${allParams.join(' ')} async></script>`,
            description: <>This code can be embedded into any webpage - no need to
                include Stellar SDK or write any code. It will be automatically substituted with a payment
                button upon loading. The weapon of choice for simple integration cases.
            </>
        }
    }

    generateAlbedoScriptCode() {
        const paymentParams = this.getPaymentIntentParams(),
            {width, height, className} = this.state,
            args = []
        for (const key of Object.keys(paymentParams)) {
            args.push(`    ${key}: '${paymentParams[key].replace('\'', '\\\'')}'`)
        }
        const script = `<button id="payment_button" style="width:${width}px;height:${height}px"${className ? ` class="${className}"` : ''}>${this.formatCaption()}</button>
<script>
document.getElementById('payment_button').addEventListener('click', function(e){
  albedo.pay({
${args.join(',\n')}
  })
  .then(res => console.log('success', res))
  .catch(e => console.error(e))
}, false)
</script>`
        return {
            script,
            description: <>Fully customizable integration for online shops, payment gateways, service providers.
                The best option for client-side JS frameworks like React or Angular. Requires Albedo intent library.
            </>
        }
    }

    generateWebStellarLink() {
        const paymentParams = this.getPaymentIntentParams(),
            formatted = Object.keys(paymentParams).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(paymentParams[k])}`),
            script = `<a href="web+stellar:pay?${formatted.join('&')}" target="_blank">${this.formatCaption()}</a>`
        return {
            script,
            description: <>
                <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md"
                   target="_blank">SEP0007</a>-formatted payment request link compatible with some other Stellar
                wallets. Supports a subset of Albedo features. Doesn't require Stellar SDK or Albedo intent script.
            </>
        }
    }

    renderParameters() {
        return <>
            {params.map(param => {
                const {name, description, optional} = param,
                    value = this.getParamValue(name, param) || ''
                return <div key={name}>
                    <label><code>{name}</code> - {optional && '(optional) '}{description}</label>
                    <input type="text" value={value}
                           onChange={e => this.setParam(name, e.target.value)}/>
                </div>
            })}
        </>
    }

    renderCodeBlock({script, description}) {
        return <>
            <p className="dimmed text-small">{description}</p>
            <Highlight lang="html">{script}</Highlight>
        </>
    }

    generateCode() {
        switch (this.state.format) {
            case 'button-script':
                return this.generateButtonScriptCode()
            case 'albedo-script':
                return this.generateAlbedoScriptCode()
            case 'link':
                return this.generateWebStellarLink()
        }
    }

    formatCaption() {
        const values = Object.assign({}, this.state)
        for (const param of params) {
            values[param.name] = this.getParamValue(param.name, param)
        }
        const {text, amount, 'asset-code': assetCode} = values
        let res = text || ''
        if (amount) {
            res += ` ${amount} ${assetCode || 'XLM'}`
        }
        return res
    }

    injectPreview(container) {
        this.previewContainer = container
        this.updatePreviewContainer(this.generateCode())
    }

    updatePreviewContainer({script}) {
        if (this.previewContainer) {
            this.previewContainer.innerHTML = `<div style="text-align: center;padding-top:2em">${script}</div>`
            const scriptTags = Array.from(this.previewContainer.querySelectorAll('script'))
            for (const oldScript of scriptTags) {
                const newScript = document.createElement('script')
                Array.from(oldScript.attributes)
                    .forEach(attr => newScript.setAttribute(attr.name, attr.value))
                if (oldScript.innerHTML) {
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML))
                }
                oldScript.parentNode.replaceChild(newScript, oldScript)
            }
        }
    }

    renderResult() {
        const {result, error} = this.state
        return result && <Highlight className={cn('result', {error})} lang="json">{result}</Highlight>
    }

    render() {
        const generatedCode = this.generateCode()
        this.updatePreviewContainer(generatedCode)
        return <div className="intent-block" style={{paddingBottom: '2em'}}>
            <h3 id="payment-request">Payment request button generator</h3>
            <div className="intent-description">
                This generator allows creating payment request buttons that can be embedded into any website in a few
                clicks. Payment buttons are an easy way to accept payments. Just provide the requested asset amount and
                destination address. Albedo will handle all the rest.
            </div>
            <div className="space">
                <b>Parameters</b>
                <div className="space">
                    {this.renderParameters()}
                </div>
            </div>
            <div className="space">
                Format: <Dropdown options={[
                {value: 'button-script', title: 'payment button script'},
                {value: 'albedo-script', title: 'customizable Albedo script'},
                {value: 'link', title: 'web+stellar link'}
            ]} value={this.state.format} onChange={value => this.setState({format: value})}/>

                <CopyToClipboard text={generatedCode.script}>
                    <a href="#" className="fa fa-copy active-icon" title="Copy script to clipboard"/>
                </CopyToClipboard>
            </div>
            <div className="micro-space">
                {this.renderCodeBlock(generatedCode)}
            </div>
            <div className="space text-small dimmed">Preview</div>
            <iframe src="/button-preview.html" frameBorder="0" style={{border: '1px solid #ddd', width: '100%'}}
                    onLoad={e => this.injectPreview(e.target.contentDocument.body)}/>
            {this.renderResult()}
        </div>
    }
}

export default DemoPaymentRequestButtonView