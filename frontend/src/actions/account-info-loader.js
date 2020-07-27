import {createHorizon} from '../util/horizon-connector'
import {isTestnet} from '../util/network-resolver'

const pending = {}

//TODO: use unified errors here
function buildError(code, text) {
    return {
        error: {
            text,
            code
        }
    }
}

function loadSelectedAccountInfo(actionContext) {
    const {intentParams, selectedPublicKey} = actionContext
    if (!selectedPublicKey) return Promise.resolve(buildError(0, 'Account not selected.'))
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
                    //request Friendbot funding
                    fetch('https://friendbot.stellar.org/?addr=' + selectedPublicKey)
                        .catch(err => console.error(err))

                }
                return buildError(404, 'Account does not exists on the ledger.')
            }
            console.error(err)
            return buildError(-1, 'Unhandled error.')
        })
        .finally(() => {
            delete pending[selectedPublicKey]
        })
    pending[selectedPublicKey] = promise
    return promise
}

export {loadSelectedAccountInfo}