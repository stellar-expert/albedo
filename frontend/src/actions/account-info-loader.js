import {createHorizon, requestFriendbotFunding} from '../util/horizon-connector'
import {isTestnet} from '../util/network-resolver'
import standardErrors from '../util/errors'

const pending = {}

function loadSelectedAccountInfo(actionContext) {
    const {intentParams, selectedPublicKey} = actionContext
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
                if (isTestnet(intentParams)) {
                    requestFriendbotFunding(selectedPublicKey)
                }
                return standardErrors.accountDoesNotExist
            }
            console.error(err)
            return standardErrors.unhandledError(err)
        })
        .finally(() => {
            delete pending[selectedPublicKey]
        })
    pending[selectedPublicKey] = promise
    return promise
}

export {loadSelectedAccountInfo}