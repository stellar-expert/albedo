import {encodeBase64} from '../util/crypto/base64'
import {generateRandomEncryptionKey} from '../util/crypto/random'

const ttl = 60 * 60 * 1000

/**
 * Temporary store credentials in the browser if this is allowed.
 * @param {Credentials} credentials
 */
export function temporarilySaveCredentials(credentials) {
    //here we assume that encryption key is correct (allows to decipher account data), otherwise, it will block the subsequent login attempts
    return
    const payload = {
        messageType: 'save-stored-credentials',
        accountId: credentials.account.id,
        data: Buffer.from(credentials.encryptionKey).toString('base64'),
        ts: new Date().getTime(),
        ttl //TODO: set TTL based on user settings
    }
    window.postMessage(payload, window.origin)
}

export function getCredentialsFromTemporaryStorage(accountId) {
    return Promise.resolve(null)
    return new Promise((resolve, reject) => {
        const __reqid = encodeBase64(generateRandomEncryptionKey(16))
        let installed = true

        function waitForCredentials(event) {
            if (event.source !== window || event.data.__reqid !== __reqid) return
            const {credentials} = event.data
            if (credentials !== undefined) {
                installed = false
                window.removeEventListener('message', waitForCredentials, false)
                resolve(credentials ? Buffer.from(credentials, 'base64') : null)
            }
        }

        window.addEventListener('message', waitForCredentials, false)
        window.postMessage({messageType: 'get-stored-credentials', accountId, __reqid}, window.origin)
        //handle case when the extension was unresponsive
        setTimeout(() => {
            if (installed) {
                window.removeEventListener('message', waitForCredentials, false)
                resolve(null)
            }
        }, 500)
    })
}