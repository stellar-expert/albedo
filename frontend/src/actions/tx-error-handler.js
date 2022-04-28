import standardErrors from '../util/errors'

export function handleTxError(err, actionContext) {
    if (err.code && err.message)
        throw err
    //something wrong with the network connection
    if (err.message === 'Network Error')
        throw standardErrors.horizonError('Network error. Failed to connect to Horizon server ' + actionContext.networkParams.horizon)
    if (err.response) { //treat as Horizon error
        if (err.response.status === 404)
            throw standardErrors.horizonError(new Error('Source account doesn\'t exist on the network.'))
        throw standardErrors.horizonError(err?.response?.data)
    }
    //unhandled error
    //TODO: add detailed error description
    throw standardErrors.unhandledError(err)
}