import pkgInfo from '../../package.json'
import actionContext from '../../src/state/action-context'
import authorizationService from '../../src/state/auth/authorization'
import {fakeWindow} from './fake-window'

const callerOrigin = 'https://example.com'
let lastRequestId = 0

/**
 * Send intent request to Albedo the same way the intent library does it.
 * @param {Object} params - Intent request params.
 * @param {String} [origin] - Caller app origin.
 * @return {Promise}
 */
export function sendIntent(params, origin = callerOrigin) {
    lastRequestId++
    return fakeWindow.callEventListenersWithParams({
        data: {__albedo_intent_version: pkgInfo.protocol, __reqid: lastRequestId, ...params},
        origin
    })
}

/**
 * Confirm the current intent request, providing credentials if the password is requested.
 * @param {Credentials} credentials - Credentials of the selected account.
 * @return {Promise}
 */
export async function confirmRequest(credentials) {
    let settled = false
    const confirmation = actionContext.confirmRequest().finally(() => settled = true)
    //wait for the password prompt (it's skipped if the authorization session is active)
    while (!settled && !authorizationService.dialogOpen) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    if (authorizationService.dialogOpen) {
        authorizationService.credentialsRequestCallback.resolve(credentials)
    }
    await confirmation
}
