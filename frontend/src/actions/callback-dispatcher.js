import errors from '../util/errors'
import {isInsideFrame} from '../util/frame-utils'
import {syncLocalStorage} from '../storage/local-storage-synchronizer'

const urlSchema = 'url:'

/**
 * POST response to callback address accordingly to SEP-0007.
 * @param {String} callback - Callback endpoint.
 * @param {Object} data - Response data.
 * @return {Promise<void>}
 */
function execSep7Callback(callback, data) {
    if (callback.indexOf(urlSchema) !== 0) return Promise.reject(new Error('Unsupported callback schema: ' + callback))
    const action = callback.substr(urlSchema.length)
    const form = document.createElement('form')

    document.body.appendChild(form)
    form.method = 'post'
    form.action = action
    form.target = '_blank'
    for (let name of Object.keys(data)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = data[name]
        form.appendChild(input)
    }
    form.submit()
    return new Promise(resolve => setTimeout(resolve, 2000))
}

/**
 * Dispatch response message back to caller.
 * @param {Object} res
 * @param {ActionContext} actionContext
 * @return {Promise}
 */
function postMessage(res, actionContext) {
    const target = locateCallerWindow()
    if (target) {
        target.postMessage({albedoIntentResult: res}, '*')
    }
    return Promise.resolve()
}

/**
 * Get the caller window handler.
 * @return {Window}
 */
function locateCallerWindow() {
    return isInsideFrame() ? window.parent : window.opener
}

/**
 * Process and send intent response back to the caller window.
 * @param {ActionContext} actionContext
 * @return {Promise}
 */
export async function dispatchIntentResponse(actionContext) {
    const {callback, walletRedirect} = actionContext.intentParams
    const {result} = actionContext
    result.__reqid = actionContext.requestId

    if (callback) {
        await execSep7Callback(callback, result)
    }
    const callerWindow = locateCallerWindow()
    if (!callerWindow || callerWindow === window) {
        if (walletRedirect) {
            window.location.href = walletRedirect
        }
        return
    }
    if (actionContext.intent === 'implicit_flow') {
        await syncLocalStorage()
    }
    return await postMessage(result, actionContext)
}

/**
 * Reject request and return an error to the caller app.
 * @param {Error|String} [error] - Rejection reason or validation error.
 * @param {ActionContext} actionContext - Current action context.
 */
export function dispatchIntentError(error, actionContext) {
    const {requestId, result, walletRedirect} = actionContext
    const errorResult = errors.prepareErrorDescription(error)
    errorResult.__reqid = requestId
    if (result) {
        Object.assign(errorResult, result)
    }
    /*//SEP-7 callback doesn't imply error handling - just show an error in UI
    alert(error.message || error)*/
    if (walletRedirect) {
        window.location.href = walletRedirect
        return
    }

    //post message back to a caller app
    return postMessage(errorResult, actionContext)
        .catch(e => console.error(e))
}
