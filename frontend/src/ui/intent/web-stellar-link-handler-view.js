import React, {useState, useEffect} from 'react'
import {parseQuery} from '../../util/url-utils'
import actionContext from '../../state/action-context'

const allowedIntents = ['tx', 'pay']

function WebStellarLinkHandlerView() {
    const [error, setError] = useState(null)
    useEffect(() => {
        const {sep0007link = ''} = parseQuery(),
            [intentPart, sepLinkParams] = sep0007link.split('?'),
            [protocol, intentName] = intentPart.split(':'),
            referrer = document.referrer && new URL(document.referrer).origin || null
        if (protocol !== 'web+stellar') return setError('Invalid web+stellar link.')
        if (!allowedIntents.includes(intentName)) {
            const origin = document.referrer ? new URL(document.referrer).origin : 'the caller application'
            setError(`Invalid operation requested: "${intentName}". It's likely an external application error. Please contact support team of ${origin}.`)
            return
        }
        const params = parseQuery(sepLinkParams)
        params.intent = intentName
        if (!params.callback) {
            params.submit = true
        }
        if (referrer) {
            params.app_origin = referrer
        }
        setError(null)
        actionContext.setContext(params)
        __history.push('/confirm')

    }, [window.location.href])
    if (!error) return <div className="loader"/>
    return <div className="error text-center double-space">{error}</div>
}

export default WebStellarLinkHandlerView