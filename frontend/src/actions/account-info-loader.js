import standardErrors from '../util/errors'
import {resolveAccountInfo} from '../util/account-info-resolver'

const pending = {}

/**
 * Load relevant account information for a user-selected account from Horizon.
 * @param {ActionContext} actionContext
 * @return {Promise<AccountResponse>}
 */
export function loadSelectedAccountInfo(actionContext) {
    const {networkParams, selectedAccount} = actionContext,
        pubkey = selectedAccount?.publicKey
    if (!pubkey) return Promise.reject(standardErrors.accountNotSelected)
    //check whether we already loading the requested account info
    const pendingPromise = pending[pubkey]
    if (pendingPromise) return pendingPromise
    //load the account
    const promise = resolveAccountInfo(pubkey, networkParams)
        .catch(err => {
            if (err.name === 'NotFoundError') {
                return {error: standardErrors.accountDoesNotExist}
            }
            console.error(err)
            return {error: standardErrors.unhandledError(err)}
        })
        .finally(() => {
            delete pending[pubkey]
        })
    pending[pubkey] = promise
    return promise
}