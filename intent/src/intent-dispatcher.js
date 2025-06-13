import intentInterface from './intent-interface.js'
import intentErrors from './intent-errors.js'
import {createDialogTransport, createIframeTransport} from './transport-builder.js'
import {getImplicitSession, saveImplicitSession} from './implicit-session-storage.js'

function intentError(msg) {
    return Object.assign(new Error(), intentErrors.invalidIntentRequest, {ext: msg})
}

/**
 * Request user's confirmation for the specified action.
 * @param {Object} params - Intent parameters.
 * @param {String} frontendUrl - URL of the Albedo frontend.
 * @return {Promise}
 */
export function requestIntentConfirmation(params, frontendUrl) {
    try {
        const {intent} = params
        //intent should be present
        if (!intent)
            throw intentError('Parameter "intent" is required.')
        const intentDescriptor = intentInterface[intent]
        //check interface compliance
        if (!intentDescriptor)
            throw intentError(`Unknown intent: "${intent}".`)
        //build request data
        const requestParams = prepareRequestParams(intentDescriptor, params)
        //create transport and dispatch request
        return prepareTransport(requestParams, frontendUrl)
            //dispatch intent request
            .then(transport => sendRequest(requestParams, transport))
    } catch (e) {
        const {code = -1, message, ext} = e,
            res = {message, code}
        if (ext) {
            res.ext = ext
        }
        return Promise.reject(res)
    }
}

/**
 * Create/retrieve an appropriate window transport for given intent params.
 * @param {Object} params - Intent params provided by the third-party app.
 * @param {String} frontendUrl - URL of the Albedo website.
 * @return {TransportHandler}
 */
function prepareTransport(params, frontendUrl) {
    //check if intent supports implicit flow and the permission was granted to the app
    if (params.pubkey) {
        const session = getImplicitSession(params.intent, params.pubkey)
        if (session) {
            params.session = session.key
            //implicit session can be executed without a dialog window
            return createIframeTransport(frontendUrl)
        }
    }
    //create iframe transport in advance if the implicit flow has been requested
    setTimeout(() => {
        if (params.intent === 'implicit_flow') {
            createIframeTransport(frontendUrl)
        }
    }, 200)
    //create dialog window transport if only interactive authorization flow is available
    return createDialogTransport(frontendUrl)
}

/**
 * Send confirmation request for a specific intent using a suitable transport.
 * @param {Object} params - Intent params provided by the third-party app.
 * @param {TransportHandler} transport - PostMessage transport window handler.
 * @return {Promise<Object>}
 */
function sendRequest(params, transport) {
    return transport.postMessage(params)
        .then(result => {
            //handle implicit session grant response if any
            if (result.intent === 'implicit_flow' && result.granted) {
                //save implicit session to the internal session storage
                saveImplicitSession(result)
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
function prepareRequestParams(intentDescriptor, params) {
    //validate parameters
    if (typeof params !== 'object')
        throw intentError('Intent parameters expected.')
    const {intent, pubkey} = params,
        requestParams = {intent}
    //basic account public key validation
    if (pubkey && !/^G[0-9A-Z]{55}$/.test(pubkey))
        throw intentError('Invalid "pubkey" parameter. Stellar account public key expected.')
    //check required params
    for (const key in intentDescriptor.params) {
        const props = intentDescriptor.params[key],
            value = params[key]
        if (value) {
            requestParams[key] = value
        } else if (props.required) {
            throw intentError(`Parameter "${key}" is required for intent "${intent}".`)
        }
    }
    return requestParams
}