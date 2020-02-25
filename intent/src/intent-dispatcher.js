import intentInterface from './intent-interface'
import {createDialogWindow, createHiddenFrame} from './transport-builder'
import implicitSessionStorage from './implicit-session-storage'

class IntentDispatcher {
    /**
     * Request user's confirmation for the specified action.
     * @param {Object} params - Intent parameters.
     * @param {String} frontendUrl - URL of the Albedo frontend.
     * @return {Promise}
     */
    requestIntentConfirmation(params, frontendUrl) {
        const {intent} = params
        //intent should be present
        if (!intent) return Promise.reject(new Error('Parameter "intent" is required.'))
        const intentDescriptor = intentInterface[intent]
        //check interface compliance
        if (!intentDescriptor) return Promise.reject(new Error(`Unknown intent: "${intent}".`))
        //build request data
        return this.prepareRequestParams(intentDescriptor, params)
        //dispatch intent
            .then(requestParams => this.sendRequest(intentDescriptor, requestParams, frontendUrl))
    }

    sendRequest(intentDescriptor, params, frontendUrl) {
        //check if intent supports implicit flow and the permission was granted to the app
        let transport
        if (params.pubkey) {
            const session = implicitSessionStorage.getImplicitSession(params.intent, params.pubkey)
            if (session) {
                params.session = session.key
                transport = createHiddenFrame(frontendUrl)
            }
        }
        //only interactive authorization flow is available
        if (!transport) {
            transport = createDialogWindow(frontendUrl)
        }
        return transport.postMessage(params)
            .then(result => {
                //handle implicit session grant response
                if (result.intent === 'implicit_flow' && result.granted) {
                    implicitSessionStorage.addSession(result)
                }
                return result
            })
    }

    prepareRequestParams(intentDescriptor, params) {
        //validate parameters
        if (typeof params !== 'object') return Promise.reject(new Error('Intent parameters expected.'))
        const {intent, pubkey} = params,
            requestParams = {intent}
        //basic account public key validation
        if (pubkey && !/^G[0-9A-Z]{55}$/.test(pubkey)) return Promise.reject(new Error('Invalid "pubkey" parameter. Stellar account public key expected.'))
        //check required params
        for (let key in intentDescriptor.params) {
            const props = intentDescriptor.params[key],
                value = params[key]
            if (value) {
                requestParams[key] = value
            } else if (props.required) return Promise.reject(new Error(`Parameter "${key}" is required for intent "${intent}".`))
        }
        return Promise.resolve(requestParams)
    }
}

const dispatcher = new IntentDispatcher()

export default dispatcher