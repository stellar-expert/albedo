import {isInsideExtension} from '../util/extension-utils'

const storageName = 'extensionAuthStorage'

function getStorage() {
    if (!isInsideExtension()) return Promise.reject()
    const browser = require('webextension-polyfill')
    return browser.runtime.getBackgroundPage()
        .then(w => {
            let storage = w[storageName]
            if (!storage) {
                storage = w[storageName] = {}
            }
            return storage
        })
}

/**
 * Temporary store credentials in the browser if this is allowed.
 * @param {Credentials} credentials
 * @return {Promise}
 */
function saveCredentialsInExtensionStorage(credentials) {
    return getStorage()
        .then(storage => {
            //here we assume that encryption key is correct (allows to decipher account data), otherwise it will block the subsequent login attempts
            storage[credentials.account.id] = Buffer.from(credentials.encryptionKey).toString('base64')
        })
        .catch(() => {/*storage is not available - ignore error*/
        })
}

function getCredentialsFromExtensionStorage(accountId) {
    return getStorage()
        .then(storage => {
            const val = storage[accountId]
            if (!val) return undefined
            return Buffer.from(val, 'base64')
        })
}

export {saveCredentialsInExtensionStorage, getCredentialsFromExtensionStorage}