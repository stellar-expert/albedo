import intentInterface from './intent-interface'
import {createDialogTransport, createIframeTransport} from './transport-builder'
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
        let requestParams
        try {
            requestParams = this.prepareRequestParams(intentDescriptor, params)
        } catch (e) {
            return Promise.reject(e)
        }
        //dispatch intent
        return this.sendRequest(requestParams, frontendUrl)
    }

    /**
     * Send confirmation request for a specific intent using a suitable transport.
     * @param {Object} params - Intent params provided by the third-party app.
     * @param {String} frontendUrl - URL of the Albedo website.
     * @return {Promise<Object>}
     */
    sendRequest(params, frontendUrl) {
        //check if intent supports implicit flow and the permission was granted to the app
        let transport
        //try to retrieve an implicit session
        if (params.pubkey) {
            const session = implicitSessionStorage.getImplicitSession(params.intent, params.pubkey)
            if (session) {
                params.session = session.key
                //implicit session can be executed without a dialog window
                transport = createIframeTransport(frontendUrl)
            }
        }
        //create dialog window transport if only interactive authorization flow is available
        if (!transport) {
            transport = createDialogTransport(frontendUrl)
        }
        return transport.postMessage(params)
            .then(result => {
                //handle implicit session grant response if any
                if (result.intent === 'implicit_flow' && result.granted) {
                    //save implicit session to the internal session storage
                    implicitSessionStorage.addSession(result)
                }
                return result
            })
    }

    /**
     * Pre-process request params provided by the third-party app.
     * @param {Object} intentDescriptor - Requested intent descriptor - contains the list of available params.
     * @param {Object} params - Intent params provided by the third-party app.
     * @return {Object}
     */
    prepareRequestParams(intentDescriptor, params) {
        //validate parameters
        if (typeof params !== 'object')
            throw new Error('Intent parameters expected.')
        const {intent, pubkey} = params,
            requestParams = {intent}
        //basic account public key validation
        if (pubkey && !/^G[0-9A-Z]{55}$/.test(pubkey))
            throw new Error('Invalid "pubkey" parameter. Stellar account public key expected.')
        //check required params
        for (const key in intentDescriptor.params) {
            const props = intentDescriptor.params[key],
                value = params[key]
            if (value) {
                requestParams[key] = value
            } else if (props.required)
                throw new Error(`Parameter "${key}" is required for intent "${intent}".`)
        }
        return requestParams
    }
}

const dispatcher = new IntentDispatcher()

export default dispatcher