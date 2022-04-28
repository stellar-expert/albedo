import {intentErrors} from '@albedo-link/intent'

class AlbedoError extends Error {
    constructor(message) {
        super(message)
        this.name = 'AlbedoError'
    }

    /**
     * Unique error code.
     * @type {Number}
     */
    code = 0

    /**
     * Extended error info (if available).
     */
    ext

    toJSON() {
        const res = {message: this.message, code: this.code}
        if (this.ext) {
            res.ext = this.ext
        }
        return res
    }
}

function buildError(params) {
    const {message, code = 0, ext} = params
    const error = new AlbedoError(message)
    error.code = code
    if (ext) {
        error.ext = ext
    }
    return error
}

class StandardErrors {
    unhandledError(error) {
        console.error(error)
        return buildError({
            message: 'Unhandled error occurred. If this error persists, please contact Albedo support.',
            code: -1
        })
    }

    externalError(error) {
        return buildError({
            message: 'External error occurred.',
            ext: error.message,
            code: -2
        })
    }

    invalidIntentRequest(intentErrors) {
        return buildError({
            message: 'Intent request is invalid.',
            ext: intentErrors,
            code: -3
        })
    }

    get actionRejectedByUser() {
        return buildError({
            message: 'Action request was rejected by the user.',
            code: -4
        })
    }

    horizonError(data) {
        return buildError({
            message: 'Transaction failed during execution in Stellar network.',
            ext: data,
            code: -5
        })
    }

    callbackError(data) {
        return buildError({
            message: 'Callback redirect failed.',
            ext: data,
            code: -6
        })
    }

    get invalidSecretKey() {
        return buildError({
            message: 'Invalid Stellar secret key. Please check if you copied it correctly.',
            code: -1101
        })
    }

    get emptySecretKey() {
        return buildError({
            message: 'Stellar secret key is required.',
            code: -1102
        })
    }

    get invalidPasswordFormat() {
        return buildError({
            message: 'Invalid password format. Please provide a valid password.',
            code: -1103
        })
    }

    get invalidPassword() {
        return buildError({
            message: 'Invalid account password. Please provide a valid password.',
            code: -1104
        })
    }

    get accountNotSelected() {
        return buildError({
            message: 'Account not selected.',
            code: -1105
        })
    }

    get accountDoesNotExist() {
        return buildError({
            message: 'Account does not exist on the ledger.',
            code: -1106
        })
    }

    get messageSigningFailed() {
        return buildError({
            message: 'Failed to sign a message.',
            code: -2001
        })
    }

    //Ledger-specific errors
    get hashSigningNotAllowed() {
        return buildError({
            message: 'Ledger Wallet requires hash signing permission to be enabled in the app settings.',
            code: -2002
        })
    }

    /**
     * Prepare an error for the serialization before sending via postMessage
     * @param {Error|Object|String} error
     */
    prepareErrorDescription(error) {
        if (error.code === undefined) {
            error = standardErrors.unhandledError(error)
        }
        //find a relevant standard intent error by code
        let stdError = Object.values(intentErrors).find(stdError => stdError.code === error.code)
        if (!stdError) {
            error = intentErrors.unhandledError
        } else {
            error = Object.assign({}, stdError, {ext: error.ext})
        }

        return {error}
    }
}

const standardErrors = new StandardErrors()

export default standardErrors