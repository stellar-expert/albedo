import errors from '../util/errors'
import {isInsideFrame} from '../util/frame-utils'
import storageProvider from '../state/storage-provider'

const urlSchema = 'url:'

/**
 * POST response to callback address accordingly to SEP-0007.
 * @param {String} callback - Callback endpoint.
 * @param {Object} data - Response data.
 * @return {Promise<void>}
 */
function execCallback(callback, data) {
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
    return Promise.resolve()
}

function postMessage(res, actionContext) {
    const target = locateCallerWindow(actionContext)
    if (!target) {
        return Promise.reject('Caller application browser window was not found.')
    }
    target.postMessage({albedoIntentResult: res}, '*')
    return Promise.resolve()
}

function locateCallerWindow() {
    return isInsideFrame() ? window.parent : window.opener
}

/**
 * Send synchronize localStorage command to same origin iframes.
 */
export async function syncLocalStorage() {
    //do not allow to send sync commands from iframes
    if (isInsideFrame()) return
    //obtain caller window reference
    const caller = window.opener
    if (!caller || caller === window) return
    //copy all data from localStorage
    const dataToSync = {}
    const allKeys = await storageProvider.enumerateKeys()
    for (let key of allKeys) {
        dataToSync[key] = await storageProvider.getItem(key)
    }
    //try to find and sync implicit transport iframe
    const {frames} = caller
    for (let i = 0; i < frames.length; i++) {
        try {
            const frame = frames[i]
            if (frame.origin === window.origin) { //assume it's an implicit container iframe
                frame.postMessage({sync: dataToSync}, window.origin)
            }
        } catch (e) {
            //the frame is inaccessible - ignore errors
        }
    }
}

/**
 * Process and send intent response back to the caller window.
 * @param {Object} res - Response object.
 * @param {ActionContext} actionContext - Action context to use
 * @return {Promise<void>}
 */
export async function dispatchIntentResponse(res, actionContext) {
    const {callback, __reqid} = actionContext.intentParams
    res.__reqid = __reqid

    if (callback) {
        await execCallback(callback, res)
    }
    const callerWindow = locateCallerWindow()
    if (!callerWindow || callerWindow === window) return res
    if (actionContext.intent === 'implicit_flow') {
        syncLocalStorage()
    }
    return postMessage(res, actionContext)
}

/**
 * Reject the request.
 * @param {Error|String} [error] - Rejection reason or validation error.
 * @param {ActionContext} actionContext - Current action context.
 */
export function handleIntentResponseError(error, actionContext) {
    if (!error) {
        error = errors.actionRejectedByUser
    }
    error = errors.prepareErrorDescription(error, actionContext.intentParams)

    const {callback} = actionContext.intentParams
    if (callback) {
        alert(error.message || error)
    } else {
        return postMessage(error, actionContext)
            .catch(e => console.error(e))
    }
}
