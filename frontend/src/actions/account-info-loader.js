import {createHorizon} from '../util/horizon-connector'
import standardErrors from '../util/errors'

const pending = {}

function loadSelectedAccountInfo(actionContext) {
    const {intent, intentParams, selectedPublicKey} = actionContext
    if (!selectedPublicKey) return Promise.resolve(standardErrors.accountNotSelected)
    //check whether we already loading the requested account info
    const pendingPromise = pending[selectedPublicKey]
    if (pendingPromise) return pendingPromise
    //load the account
    const promise = createHorizon(intentParams)
        .loadAccount(selectedPublicKey)
        .then(acc => {
            return acc
        })
        .catch(err => {
            if (err.name === 'NotFoundError') {
                return {error: standardErrors.accountDoesNotExist}
            }
            console.error(err)
            return {error: standardErrors.unhandledError(err)}
        })
        .finally(() => {
            delete pending[selectedPublicKey]
        })
    pending[selectedPublicKey] = promise
    return promise
}

export {loadSelectedAccountInfo}