import {intentErrors} from 'albedo-intent'

class AlbedoError extends Error {
    constructor(message) {
        super(message)
        this.name = 'AlbedoError'
    }

    /**
     * Unique code.
     * @type {Number}
     */
    code = 0

    /**
     * Whether an error is critical or not.
     * @type {Boolean}
     */
    critical = true
}

function buildError(params) {
    const {message, code = 0, ext} = params
    const error = new Error(message)
    error.code = code
    if (ext) {
        error.ext = ext
    }
    if (params instanceof Error) {
        error.originalError = params
    }
    return error
}

class StandardErrors {
    unhandledError(error) {
        console.error(error)
        return buildError({
            message: 'Unhandled error occurred. If this error persists, please contact our support team.',
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

    get messageSigningFailed() {
        return buildError({
            message: 'Failed to sign a message.',
            code: -5
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

    /*accountNonPersistent() {
        return buildError({
        message: 'Account was not saved server-side. Enable the multi-login feature first.',
        code: -103
    }) },*/
    get invalidPassword() {
        return buildError({
            message: 'Invalid account password. Please provide a valid password.',
            code: -1104
        })
    }

    get encryptedSecretKeyNotFound() {
        return buildError({
            message: 'Error decrypting account. Encrypted secret key not found.',
            code: -1105
        })
    }

    get invalid2FATotpKeyFormat() {
        return buildError({
            message: 'Invalid 2FA TOTP key format.',
            code: -1201
        })
    }

    get invalid2FAVerificationCodeFormat() {
        return buildError({
            message: 'Invalid 2FA verification code format.',
            code: -1202
        })
    }

    get invalid2FAVerificationCode() {
        return buildError({
            message: 'Invalid 2FA verification code.',
            code: -1202
        })
    }

    //Ledger-specific errors
    get hashSigningNotAllowed() {
        return buildError({
            message: 'Ledger Wallet requires hash signing permission to be enabled in the app settings.',
            code: -2001
        })
    }

    /**
     * Prepare an error for the serialization before sending via postMessage
     * @param {Error|Object} error
     * @param {Object} intentParams
     */
    prepareErrorDescription(error, intentParams) {
        if (!(error instanceof Error)) {
            error = standardErrors.unhandledError(error)
        }
        if (error.code === undefined) {
            error = standardErrors.unhandledError(error)
        }
        //find a relevant standard intent error by code
        const stdError = Object.values(intentErrors).find(stdError => stdError.code === error.code)
        if (stdError) {
            error = Object.assign({}, stdError, {ext: error.ext})
        } else {
            error = intentErrors.unhandledError
        }

        return {error: error || intentErrors.unhandledError, __reqid: intentParams.__reqid}
    }
}

const standardErrors = new StandardErrors()

export default standardErrors