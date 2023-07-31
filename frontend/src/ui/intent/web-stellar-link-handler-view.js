import React, {useState, useEffect} from 'react'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {replaceTokens} from '../../util/tx-replace-utils'
import {setActionContext} from '../../state/action-context-initializer'
import {resolveNetworkParams} from '../../util/network-resolver'
import SoloLayoutView from '../layout/solo-layout-view'

const allowedIntents = ['tx', 'pay']

function processLink() {
    const {sep0007link = ''} = parseQuery()
    const [intentPart, sepLinkParams] = sep0007link.split('?')
    const [protocol, intentName] = intentPart.split(':')
    const referrer = document.referrer && new URL(document.referrer).origin || null

    if (protocol !== 'web+stellar')
        return 'Invalid web+stellar link.'
    if (!allowedIntents.includes(intentName)) {
        const origin = document.referrer ? new URL(document.referrer).origin : 'the caller application'
        return `Invalid operation requested: "${intentName}". It's likely an external application error. Please contact support team of ${origin}.`
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
    setActionContext(params)
        .then(() => navigation.navigate('/confirm'))
    return null
}

function WebStellarLinkHandlerView() {
    const [error, setError] = useState(null)
    useEffect(() => {
        setError(processLink())
    }, [window.location.href])
    if (!error)
        return <SoloLayoutView title="Processing Intent">
            <div className="loader"/>
        </SoloLayoutView>
    return <SoloLayoutView title="Intent Error">
        <div className="error segment text-center double-space">{error}</div>
    </SoloLayoutView>
}

export default WebStellarLinkHandlerView