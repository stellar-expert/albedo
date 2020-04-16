import {observable, action, transaction, computed, runInAction} from 'mobx'
import AccountKeypair from './account-keypair'
import {validateAccountEmail, validateAccountPassword} from '../util/validators'
import errors from '../util/errors'
import AccountSensitiveData from './account-sensitive-data'
import {
    encryptSensitiveAccountData,
    decryptSensitiveAccountData,
    persistAccountInBrowser,
    registerAccount,
    loadAccountDataFromBrowserStorage,
    persistAccountServerSide, loadAccountFromServer
} from '../storage/account-storage'
import {saveCredentialsInExtensionStorage} from '../storage/extension-auth-storage'

const ACCOUNT_TYPES = {
    STORED_ACCOUNT: 0,
    LEDGER_ACCOUNT: 1,
    TREZOR_ACCOUNT: 2
}

/**
 * Encapsulates general account properties and serves as a root container for the associated keypairs.
 */
class Account {
    /**
     * Create an Account instance from the stored account data.
     * @param {Object} params - An object containing account properties.
     */
    constructor(params) {
        Object.assign(this, params)
        if (!this.id && params.email) {
            this.id = params.email
        }
        this.keypairs = (params.keypairs || []).map(rawKeyPair => {
            if (rawKeyPair instanceof AccountKeypair) return rawKeyPair
            return new AccountKeypair(rawKeyPair, this)
        })
        this.sessions = {}
    }

    accountType = ACCOUNT_TYPES.STORED_ACCOUNT

    /**
     * User id.
     * @type {String}
     */
    id = undefined

    /**
     * User avatar.
     * @type {String}
     */
    @observable
    avatar = undefined

    /**
     * Public keys available for the account.
     * @type {Array<AccountKeypair>}
     */
    @observable.shallow
    keypairs = []

    /**
     * Sensitive account data encrypted with encryptionKey.
     * @type {String}
     */
    encryptedData = null

    /**
     * Stored user sessions.
     * @type {Object}
     */
    sessions = null

    /**
     * Account version number used to prevent replay attacks and deal with concurrent updates.
     * @type {number}
     */
    version = 0

    /**
     * Set to true if a sensitive data has been changed.
     * @type {boolean}
     */
    #pending = false

    get displayName() {
        switch (this.accountType) {
            case ACCOUNT_TYPES.STORED_ACCOUNT:
                return this.id
            case ACCOUNT_TYPES.LEDGER_ACCOUNT:
                return 'Ledger Nano ' + this.id.substr(-4)
            case ACCOUNT_TYPES.TREZOR_ACCOUNT:
                return 'Trezor ' + this.id.substr(-4)
        }
    }

    get isHWAccount() {
        return this.accountType === ACCOUNT_TYPES.LEDGER_ACCOUNT || this.accountType === ACCOUNT_TYPES.TREZOR_ACCOUNT
    }

    get isStoredAccount() {
        return this.accountType === ACCOUNT_TYPES.STORED_ACCOUNT
    }

    /**
     * Create new account using provided credentials.
     * @param {Credentials} credentials - User credentials.
     * @return {Promise<Account>}
     */
    static signup(credentials) {
        return Promise.all([
            () => validateAccountEmail(credentials.account.id),
            () => validateAccountPassword(credentials.password)
        ])
            .then(() => registerAccount(credentials))
            .then(account => persistAccountInBrowser(new Account(account)))
    }

    /**
     * Load account data from the server.
     * @param {Credentials} [credentials] - User credentials.
     * @return {Promise<Account>}
     */
    @action
    async load(credentials) {
        this.verifyCredentials(credentials)
        const {data, version} = await loadAccountFromServer(credentials)
        if (version === undefined) throw new Error('Invalid account metadata.')
        this.loadSensitiveData(credentials, data)
        if (this.version > version) throw new Error(`Encrypted data version mismatch.`)
        //store in extension if allowed
        await saveCredentialsInExtensionStorage(credentials)
        persistAccountInBrowser(this)
        return this
    }

    @action
    async save(credentials) {
        this.verifyCredentials(credentials)
        //TODO: handle concurrent update errors here
        const {data} = await persistAccountServerSide(credentials)
        this.loadSensitiveData(credentials, data)
        persistAccountInBrowser(this)
        return this
    }

    /**
     * Request temporary access to the sensitive account data.
     * @returns {AccountSensitiveData}
     */
    @action
    requestSensitiveData(credentials) {
        this.verifyCredentials(credentials)
        return decryptSensitiveAccountData(credentials)
    }

    /**
     * Modify stored sensitive data.
     * @param {Credentials} credentials
     * @param {AccountSensitiveData} sensitiveData - New account sensitive data.
     */
    @action
    async updateSensitiveData(credentials, sensitiveData) {
        if (this.#pending) throw new Error(`Account has pending unsaved changes. All changes should be saved before the next sensitive data modification.`)
        this.verifyCredentials(credentials)
        this.version++
        sensitiveData.setVersion(this.version)
        const encryptedData = encryptSensitiveAccountData(credentials, sensitiveData)
        this.loadSensitiveData(credentials, encryptedData)
    }

    verifyCredentials(credentials, requireTotpCode = false) {
        if (!credentials) throw new TypeError('Invalid credentials.')
        if (credentials.account !== this) throw new Error('Credentials account does not match invocation account.')
        if (!credentials.checkValidity(requireTotpCode)) throw new Error('Credentials invalid.')
    }

    @action
    loadSensitiveData(credentials, encryptedData) {
        runInAction(() => {
            this.encryptedData = encryptedData
            const sensitiveData = this.requestSensitiveData(credentials)
            this.keypairs = sensitiveData.keys.map(kp => kp.createKeypairInfo(this)) || []
            if (sensitiveData.version) {
                this.version = sensitiveData.version
            }
        })
        return this
    }

    /**
     * Add new keypair to the account.
     * @param {AccountKeypair} newKeypair - Keypair to add.
     * @return {Boolean} true if a keypair has been added or updated and false otherwise
     */
    @action
    addKeypair(newKeypair) {
        if (!(newKeypair instanceof AccountKeypair)) throw 'Invalid account keypair'
        const existing = this.keypairs.find(kp => kp.publicKey === newKeypair.publicKey)
        if (existing) {
            if (existing.friendlyName !== newKeypair.friendlyName) {
                existing.friendlyName = newKeypair.friendlyName
                return true
            }
        } else {
            this.keypairs.push(newKeypair)
            newKeypair.account
            return true
        }
        return false
    }

    /**
     * Prepare account data for serialization.
     * @return {Object}
     */
    toJSON() {
        return {
            id: this.id,
            avatar: this.avatar || undefined,
            encryptedData: this.encryptedData,
            keypairs: this.keypairs,
            sessions: this.sessions,
            accountType: this.accountType
        }
    }
}

export default Account
export {ACCOUNT_TYPES}