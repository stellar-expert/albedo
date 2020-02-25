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
    if (!params) return standardErrors.unhandledError
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

//TODO: use getters instead of functions, move descriptions to the intent interface, use negative error codes
class StandardErrors {
    get unhandledError() {
        return buildError({
            message: 'Error occurred. If this error persists, please contact our support team.',
            code: -1
        })
    }

    get actionRejectedByUser() {
        return buildError({
            message: 'Action request was rejected by the user.',
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

    get messageSigningFailed() {
        return buildError({
            message: 'Failed to sign a message.',
            code: -4
        })
    }

    get invalidEmail() {
        return buildError({
            message: 'Invalid email format.',
            code: -1100
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
}

const standardErrors = new StandardErrors()

export default standardErrors