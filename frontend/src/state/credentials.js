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
        if (!this.encryptionKey||!this.authKey) return false
        if (requireTotpCode) {
            //check TOTP code
            if (!this.totp) return false
            //check that TOTP code is not expired (30 seconds)
            if (this.timestamp.getTime() + 30000 < new Date()) return false
        }
        //otherwise everything seems legit
        return true
    }

    static async create({account, password, totp, totpKey, encryptionKey}) {
        if (!encryptionKey) {
            encryptionKey = await computeArgon2Hash(account.id + password)
        }
        const authKey = derivePublicKeyFromSecret(encryptionKey)

        return Object.assign(new Credentials(), {
            account,
            password,
            totp,
            totpKey,
            timestamp: new Date(),
            encryptionKey,
            authKey
        })
    }
}

export default Credentials