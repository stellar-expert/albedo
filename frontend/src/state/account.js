import {observable, action, computed, makeObservable} from 'mobx'
import {Keypair, StrKey} from 'stellar-sdk'
import {formatLongHex} from '@stellar-expert/ui-framework'
import errors from '../util/errors'
import {encryptAccountSecret, decryptAccountSecret, persistAccountInBrowser} from '../storage/account-storage'
import {extractDeviceId} from '../util/device-id-generator'
import {currentStorageVersion} from '../storage/storage-version'

const ACCOUNT_TYPES = {
    STORED_ACCOUNT: 0,
    LEDGER_ACCOUNT: 1,
    TREZOR_ACCOUNT: 2
}

function cleanBipPath(path) {
    return path.replace('^m', '')
}

/**
 * Encapsulates general account properties and serves as a root container for the associated keypairs
 */
class Account {
    /**
     * Create an Account instance from the stored account data
     * @param {Object} params - An object containing account properties
     */
    constructor(params) {
        makeObservable(this, {
            friendlyName: observable,
            displayName: computed,
            shortDisplayName: computed,
            requestAccountSecret: action
        })

        Object.assign(this, params)
    }

    /**
     * Account ID
     * @type {String}
     */
    id = undefined

    accountType = ACCOUNT_TYPES.STORED_ACCOUNT

    /**
     * User-defined friendly name
     * @type {String}
     */
    friendlyName = null

    /**
     * Public key of the account
     * @type {String}
     */
    publicKey = null

    /**
     * BIP-44 derivation path (only for hardware wallets)
     * @type {String}
     */
    path = null

    /**
     * Sensitive account data encrypted with encryptionKey
     * @type {String}
     */
    encryptedSecret = null

    /**
     * Session expiration timeout for consecutive sign requests
     * @type {Number}
     */
    sessionTimeout = null

    /**
     * Title to display in UI
     * @returns {String}
     */
    get displayName() {
        if (this.accountType && !this.accountType) return this.shortDisplayName
        return `${this.shortDisplayName} (${formatLongHex(this.publicKey, 8)})`
    }

    get shortDisplayName() {
        if (this.friendlyName) return this.friendlyName
        switch (this.accountType) {
            case ACCOUNT_TYPES.STORED_ACCOUNT:
                return formatLongHex(this.publicKey, 12)
            case ACCOUNT_TYPES.LEDGER_ACCOUNT:
                return `Ledger ${cleanBipPath(this.path)}`
            case ACCOUNT_TYPES.TREZOR_ACCOUNT:
                return `Trezor ${cleanBipPath(this.path)}`
        }
    }

    get isHWAccount() {
        return this.accountType === ACCOUNT_TYPES.LEDGER_ACCOUNT || this.accountType === ACCOUNT_TYPES.TREZOR_ACCOUNT
    }

    get isStoredAccount() {
        return this.accountType === ACCOUNT_TYPES.STORED_ACCOUNT
    }

    /**
     * Create new account using provided credentials
     * @param {Credentials} credentials - User credentials
     * @param {String} [secret] - Stellar account secret
     * @param {String} [friendlyName] - Friendly account name to display
     * @return {Promise<Account>}
     */
    static async createNew(credentials, secret, friendlyName) {
        if (!credentials.encryptionKey) throw new Error(`Invalid credentials`)
        const pubkey = Keypair.fromSecret(secret).publicKey()
        const account = new Account({
            id: extractDeviceId(pubkey),
            friendlyName,
            publicKey: pubkey,
            encryptedSecret: encryptAccountSecret(credentials, secret)
        })
        await persistAccountInBrowser(account)
        return account
    }

    async save(credentials) {
        this.verifyCredentials(credentials)
        await persistAccountInBrowser(this)
        return this
    }

    /**
     * Request temporary access to the sensitive account data
     * @returns {String}
     */
    requestAccountSecret(credentials) {
        this.verifyCredentials(credentials)
        const secret = decryptAccountSecret(credentials)
        if (!StrKey.isValidEd25519SecretSeed(secret)) return null
        return secret
    }

    verifyCredentials(credentials) {
        if (!credentials) throw new TypeError('Invalid credentials.')
        if (credentials.account !== this) throw new Error('Credentials account does not match invocation account.')
        if (!credentials.checkValidity()) throw new Error('Invalid credentials.')
    }

    /**
     * Prepare account data for serialization
     * @return {Object}
     */
    toJSON() {
        const res = {
            id: this.id,
            accountType: this.accountType,
            publicKey: this.publicKey,
            version: currentStorageVersion
        }
        if (this.path) {
            res.path = this.path
        }
        if (this.friendlyName) {
            res.friendlyName = this.friendlyName
        }
        if (this.encryptedSecret) {
            res.encryptedSecret = this.encryptedSecret
        }
        if (this.sessionTimeout !== null) {
            res.sessionTimeout = this.sessionTimeout
        }
        return res
    }
}

export default Account
export {ACCOUNT_TYPES}