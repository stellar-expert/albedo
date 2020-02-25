import {computeArgon2Hash, derivePublicKeyFromSecret} from '../util/crypto-utils'

/**
 * Contains authorization credentials for a given account.
 */
class Credentials {
    /**
     * Account
     * @type {Account}
     */
    account

    /**
     * A password provided by user.
     * @type {String}
     */
    password

    /**
     * One-time TOTP password.
     * @type {String}
     */
    totp

    /**
     * TOTP secret.
     * @type {String}
     */
    totpKey

    /**
     * Credentials created timestamp.
     * @type {Date}
     */
    timestamp

    /**
     * Sensitive data encryption key derived from an account email + password and hashed using Argon2.
     * @type {Buffer}
     */
    encryptionKey

    /**
     * Public key derived from the encryptionKey. Used for requests authentication and as a server record id.
     * @type {String}
     */
    authKey

    /**
     * Whether credentials are valid or not.
     * @returns {boolean}
     */
    checkValidity(requireTotpCode = false) {
        //account should be present
        if (!this.account || !this.account.id) return false
        //check password
        if (!this.password) return false
        if (requireTotpCode) {
            //check TOTP code
            if (!this.totp) return false
            //check that TOTP code is not expired (30 seconds)
            if (this.timestamp.getTime() + 30000 < new Date()) return false
        }
        //otherwise everything seems legit
        return true
    }

    static async create(params = {}) {
        const encryptionKey = await computeArgon2Hash(params.account.id + params.password),
            authKey = derivePublicKeyFromSecret(encryptionKey),
            res = new Credentials()

        Object.assign(res, {
            account: params.account,
            password: params.password,
            totp: params.totp,
            totpKey: params.totpKey,
            timestamp: new Date(),
            encryptionKey,
            authKey
        })
        //Object.freeze(res)
        return res
    }
}

export default Credentials