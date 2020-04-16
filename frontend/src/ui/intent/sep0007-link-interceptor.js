import React from 'react'
import PropTypes from 'prop-types'
import {parseQuery} from '../../util/url-utils'
import intent, {intentInterface} from 'albedo-intent'

const allowedIntents = ['tx', 'pay']

class Sep0007LinkInterceptor extends React.Component {
    state = {
        error: null
    }

    componentDidMount() {
        this.handleWebStellarLink()
    }

    parseIntent() {
        const intentName = window.location.pathname
        if (!allowedIntents.includes(intentName)) {
            const origin = document.referrer ? new URL(document.referrer).origin : 'your application'
            this.setState({error: `Invalid operation requested: ${intentName}. It's likely an external application error. Please contact support team of ${origin}.`})
            return
        }
        this.setState({error: null})
        return intentName
    }

    handleWebStellarLink() {
        const intentName = this.parseIntent()
        if (!intentName) return
        intent.request(intentName, parseQuery())
            .then(res => {
                console.log(res)
            })
            .catch(e => {
                console.error(e)
                this.setState({error: `Operation failed.`})
            })
    }

    render() {
        const {error} = this.state
        if (error) return <div className="error text-center double-space">{error}</div>
        return <div></div>
    }
}

export default Sep0007LinkInterceptor