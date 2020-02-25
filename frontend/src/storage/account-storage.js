import ApiCall from '../api/api-call-builder'
import {decryptDataAes, encryptDataAes, derivePublicKeyFromSecret} from '../util/crypto-utils'
import Account from '../state/account'
import AccountKeypair from '../state/account-keypair'
import AccountSensitiveData from '../state/account-sensitive-data'

const accountKeyPrefix = 'account_'

/**
 * Load all stored accounts.
 * @returns {String[]} all accounts (emails) stored in the browser.
 */
function enumerateStoredAccounts() {
    return Object.keys(localStorage)
        .filter(key => key.indexOf(accountKeyPrefix) === 0)
        .map(key => key.substring(accountKeyPrefix.length))
}

/**
 * Load an account from the browser storage an id.
 * @param {String} id - User account id.
 * @returns {Promise<Object>}
 */
function loadAccountDataFromBrowserStorage(id) {
    if (!id || typeof id !== 'string' || id.length < 5) return Promise.reject(`Invalid account key: ${id}.`)
    const storedAccount = localStorage[accountKeyPrefix + id]
    if (!storedAccount) throw new Error(`Account ${id} is not stored in the browser.`)
    return JSON.parse(storedAccount)
}

/**
 * Encrypt account keypairs.
 * @param {Credentials} credentials - User credentials.
 * @param {AccountSensitiveData} sensitiveData - Sensitive account data to encrypt.
 * @returns {String}
 */
function encryptSensitiveAccountData(credentials, sensitiveData) {
    if (!(sensitiveData instanceof AccountSensitiveData)) throw new Error('Invalid sensitive data provided')
    return encryptDataAes(JSON.stringify(sensitiveData), credentials.encryptionKey)
}

/**
 * Decrypt account keypairs.
 * @param {Credentials} credentials - User credentials.
 * @returns {AccountSensitiveData}
 */
function decryptSensitiveAccountData(credentials) {
    const {account} = credentials
    if (!account.encryptedData) return new AccountSensitiveData()
    const decrypted = JSON.parse(decryptDataAes(account.encryptedData, credentials.encryptionKey))
    return new AccountSensitiveData(decrypted)
}

/**
 * Register new user account.
 * @param {Credentials} credentials - User credentials.
 * @returns {Promise<Account>}
 */
function registerAccount(credentials) {
    const {account} = credentials
    if (account.version !== 1)
        throw new Error(`Invalid sensitive data version: ${account.version}. Expected 1.`)

    return new ApiCall('keystore')
        .data({
            id: credentials.authKey,
            version: account.version,
            data: account.encryptedData
        })
        .authorize(credentials)
        .post()
        .then(res => {
            //TODO: check the result from server
            return account
        })
}

/**
 * Save an account on the server if multiLogin feature is enabled.
 * @param {Credentials} credentials - User credentials.
 * @param {{authPublicKey: String, totpKey: String}} updatedAuthorizationCredentials - Updated account authorization settings.
 * @returns {Promise<Account>}
 */
function persistAccountServerSide(credentials, updatedAuthorizationCredentials = null) {
    const {account} = credentials,
        id = credentials.authKey,
        payload = {
            id,
            version: account.version,
            data: account.encryptedData
        }

    //include updated authorization settings if provided
    if (updatedAuthorizationCredentials) {
        const {totpKey} = updatedAuthorizationCredentials
        //update TOTP secret
        if (totpKey) {
            payload.totpKey = totpKey
        }
    }

    return new ApiCall(`keystore/${encodeURIComponent(id)}`)
        .data(payload)
        .authorize(credentials)
        .put()
}

/**
 * Load account data from the server.
 * @param {Credentials} credentials - User credentials.
 * @returns {Promise<Object>}
 */
function loadAccountFromServer(credentials) {
    return new ApiCall(`keystore/${encodeURIComponent(credentials.authKey)}`)
        //.authorize(credentials)
        .get()
}

/**
 * Save an account to the browser storage.
 * @param {Account} account - An account to save.
 * @returns {Account}
 */
function persistAccountInBrowser(account) {
    if (!account.id) throw new Error('Account can\'t be stored.')
    localStorage.setItem(accountKeyPrefix + account.id, JSON.stringify(account.toJSON()))
    return account
}

function eraseAccountInBrowser(account) {
    if (!account.id) throw new Error('Invalid account.')
    localStorage.removeItem(accountKeyPrefix + account.id)
    return account
}

function updateRecentAccount(account) {
    if (!account || !account.id) {
        localStorage.removeItem('activeAccount')
    } else if ((retrieveRecentAccount() || {}).id !== account) {
        localStorage.setItem('activeAccount', account.id)
    }
}

function retrieveRecentAccount() {
    return localStorage.getItem('activeAccount') || null
}

export {
    enumerateStoredAccounts,
    encryptSensitiveAccountData,
    decryptSensitiveAccountData,
    persistAccountInBrowser,
    loadAccountDataFromBrowserStorage,
    persistAccountServerSide,
    loadAccountFromServer,
    registerAccount,
    eraseAccountInBrowser,
    updateRecentAccount,
    retrieveRecentAccount
}