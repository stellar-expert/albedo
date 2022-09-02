import React, {useState, useEffect} from 'react'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {replaceTokens} from '../../util/tx-replace-utils'
import {setActionContext} from '../../state/action-context-initializer'
import {resolveNetworkParams} from '../../util/network-resolver'

const allowedIntents = ['tx', 'pay']

function WebStellarLinkHandlerView() {
    const [error, setError] = useState(null)
    useEffect(() => {
        const {sep0007link = ''} = navigation.query,
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
        if (params.network_passphrase) {
            params.network = params.network_passphrase
        }

        replaceTokens(params, resolveNetworkParams(params))
        setError(null)
        setActionContext(params)
            .then(() => navigation.navigate('/confirm'))

    }, [window.location.href])
    if (!error) return <div className="loader"/>
    return <div className="error text-center double-space">{error}</div>
}

export default WebStellarLinkHandlerView