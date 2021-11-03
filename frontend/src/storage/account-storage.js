import {decryptDataAes, encryptDataAes} from '../util/crypto-utils'
import {currentStorageVersion} from './storage-version'
import storageProvider from './storage-provider'
import {syncLocalStorage} from './local-storage-synchronizer'

const accountKeyPrefix = 'account_'

/**
 * Load all stored accounts.
 * @returns {Promise<String[]>} all accounts stored in the browser.
 */
export async function enumerateStoredAccounts() {
    const keys = await storageProvider.enumerateKeys()
    return keys
        .filter(key => key.indexOf(accountKeyPrefix) === 0)
        .map(key => key.substring(accountKeyPrefix.length))
}

/**
 * Load an account from the browser storage an id.
 * @param {String} id - User account id.
 * @returns {Promise<Object>}
 */
export async function loadAccountDataFromBrowserStorage(id) {
    if (!id || typeof id !== 'string' || id.length < 5) return Promise.reject(`Invalid account key: ${id}.`)
    const storedAccount = await storageProvider.getItem(accountKeyPrefix + id)
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
export function encryptAccountSecret(credentials, secret) {
    return encryptDataAes(secret, credentials.encryptionKey)
}

/**
 * Decrypt account keypairs.
 * @param {Credentials} credentials - User credentials.
 * @returns {String}
 */
export function decryptAccountSecret(credentials) {
    const {account} = credentials
    if (!account.encryptedSecret) return null
    return decryptDataAes(account.encryptedSecret, credentials.encryptionKey)
}

/**
 * Save an account to the browser storage.
 * @param {Account} account - An account to save.
 * @returns {Promise<Account>}
 */
export async function persistAccountInBrowser(account) {
    if (!account.id) throw new Error('Account can\'t be stored.')
    await storageProvider.setItem(accountKeyPrefix + account.id, JSON.stringify(account.toJSON()))
    await syncLocalStorage()
    return account
}

export async function forgetAccount(account) {
    if (!account.id) throw new Error('Invalid account.')
    await storageProvider.removeItem(accountKeyPrefix + account.id)
    await syncLocalStorage()
    return account
}

export async function updateRecentAccount(account) {
    if (!account || !account.id) {
        await storageProvider.removeItem('activeAccount')
    } else if ((await retrieveRecentAccount() || {}).id !== account) {
        await storageProvider.setItem('activeAccount', account.id)
    }
    await syncLocalStorage()
}

export async function retrieveRecentAccount() {
    return await storageProvider.getItem('activeAccount') || null
}