import {computeArgon2Hash} from '../../util/crypto/argon2'
import {derivePublicKeyFromSecret} from '../../util/crypto/ed25519'
import {saveCredentialsInExtensionStorage} from '../../storage/extension-auth-storage-interface'

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
     * Credentials created timestamp.
     * @type {Date}
     */
    timestamp

    /**
     * Sensitive data encryption key derived from the password and unique browser id. Hashed using Argon2di.
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
    checkValidity() {
        //account should be present
        if (!this.account || !this.account.id) return false
        //check password
        if (!this.encryptionKey || !this.authKey) return false
        //otherwise everything seems legit
        return true
    }

    checkPasswordCorrect() {
        if (!this.requestAccountSecret()) return false
        saveCredentialsInExtensionStorage(this)
        return true
    }

    requestAccountSecret() {
        return this.account.requestAccountSecret(this)
    }

    /**
     * Create credentials objects.
     * @param account
     * @param password
     * @param encryptionKey
     * @returns {Promise<Credentials>}
     */
    static async create({account, password, encryptionKey}) {
        if (!encryptionKey) {
            encryptionKey = await computeArgon2Hash(password)
        }
        const authKey = derivePublicKeyFromSecret(encryptionKey)

        return Object.assign(new Credentials(), {
            account,
            password,
            timestamp: new Date(),
            encryptionKey,
            authKey
        })
    }
}

export default Credentials