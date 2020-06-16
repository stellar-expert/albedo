import {decryptDataAes, encryptDataAes, derivePublicKeyFromSecret} from '../util/crypto-utils'
import Account from '../state/account'
import {currentStorageVersion} from './storage-version'

const accountKeyPrefix = 'account_'

/**
 * Load all stored accounts.
 * @returns {String[]} all accounts stored in the browser.
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
    const storedAccount = localStorage.getItem(accountKeyPrefix + id)
    if (!storedAccount) throw new Error(`Account ${id} is not stored in the browser.`)
    const res = JSON.parse(storedAccount)
    if (res.version !== currentStorageVersion) {
        //TODO: implement storage protocol upgrades here
        return null
    }
    return res
}

/**
 * Encrypt account keypairs.
 * @param {Credentials} credentials - User credentials.
 * @param {String} secret - Account secret key.
 * @returns {String}
 */
function encryptAccountSecret(credentials, secret) {
    return encryptDataAes(secret, credentials.encryptionKey)
}

/**
 * Decrypt account keypairs.
 * @param {Credentials} credentials - User credentials.
 * @returns {String}
 */
function decryptAccountSecret(credentials) {
    const {account} = credentials
    if (!account.encryptedSecret) return null
    return decryptDataAes(account.encryptedSecret, credentials.encryptionKey)
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

function forgetAccount(account) {
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
    encryptAccountSecret,
    decryptAccountSecret,
    persistAccountInBrowser,
    loadAccountDataFromBrowserStorage,
    forgetAccount,
    updateRecentAccount,
    retrieveRecentAccount
}