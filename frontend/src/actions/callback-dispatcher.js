import errors from '../util/errors'
import {isInsideFrame} from '../util/frame-utils'

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
        //alert('Unable to process. Caller application browser window has been closed.')
        return Promise.reject('Caller application browser window was not found.')
    }
    target.postMessage({albedoIntentResult: res}, '*')
    return Promise.resolve()
}

function locateCallerWindow() {
    return isInsideFrame() ? window.top : window.opener
}

async function dispatchIntentResponse(res, actionContext) {
    const {callback, __reqid} = actionContext.intentParams
    res.__reqid = __reqid

    if (callback) {
        await execCallback(callback, res)
    }
    const callerWindow = locateCallerWindow()
    if (!callerWindow || callerWindow === window) return res
    return postMessage(res, actionContext)
}

/**
 * Reject the request.
 * @param {Error|String} [error] - Rejection reason or validation error.
 * @param {ActionContext} actionContext - Current action context.
 */
function handleIntentResponseError(error, actionContext) {
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

export {dispatchIntentResponse, handleIntentResponseError}
