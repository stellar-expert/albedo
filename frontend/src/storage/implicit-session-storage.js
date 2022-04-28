import storageProvider from './storage-provider'
import {encodeBase64, decodeBase64} from '../util/crypto/base64'
import {decryptDataAes, encryptDataAes} from '../util/crypto/aes'
import {generateRandomEncryptionKey} from '../util/crypto/random'

const sessionPrefix = 'session_'

/**
 * @typedef {Object} SessionDescriptor
 * @property {String} pubkey
 * @property {String} sessionKey
 * @property {Number} validUntil
 */

/**
 * @typedef {Object} DecryptedImplicitSession
 * @property {String} id
 * @property {String} intents
 * @property {String} network
 * @property {String} publicKey
 * @property {String} [secret]
 * @property {Number} validUntil
 */

/**
 * Check whether the session is expired.
 * @param {Object} session - Stored session.
 * @return {boolean}
 */
function isSessionExpired(session) {
    if (!session) return false
    return session.validUntil < new Date()
}


/**
 * Derive session uid and encryption key from a given session key.
 * @param {String|Uint8Array} sessionKey
 * @return {{uid: String, encryptionKey: Uint8Array}}
 */
function splitSessionKey(sessionKey) {
    if (typeof sessionKey === 'string') {
        sessionKey = decodeBase64(sessionKey)
    }
    return {
        uid: sessionPrefix + encodeBase64(sessionKey.slice(0, 10)),
        encryptionKey: sessionKey.slice(10)
    }
}

/**
 * Save implicit session record for the account. The session key contains only a temporary random key that allows
 * to decipher session on the client side.
 * @param {Account} account - Account to save.
 * @param {Number|String} duration - Implicit session duration in seconds.
 * @param {Object} data - Extra data to encrypt.
 * @return {Promise<{pubkey: String, sessionKey: String, validUntil: Number}>}
 */
export async function saveImplicitSession(account, duration, data) {
    duration = parseInt(duration) || 0
    if (duration <= 0) {
        //min 1 hour
        duration = 3600
    }
    if (duration > 86400) {
        //max 24 hours
        duration = 86400
    }

    const sessionKey = generateRandomEncryptionKey(42),
        {uid, encryptionKey} = splitSessionKey(sessionKey),
        validUntil = new Date().getTime() + duration * 1000,
        dataToEncrypt = {
            id: account.id,
            validUntil,
            ...data
        },
        encryptedSecret = encryptDataAes(JSON.stringify(dataToEncrypt), encryptionKey),
        sessionData = {
            validUntil, //we save validUntil in both encrypted and open part intentionally to prevent possible session extension attacks
            encryptedSecret
        }
    await storageProvider.setItem(uid, JSON.stringify(sessionData))
    return {
        sessionKey: encodeBase64(sessionKey),
        validUntil,
        pubkey: account.publicKey
    }
}

/**
 * Parse implicit session key and retrieve corresponding data.
 * @param {String} sessionKey
 * @return {Promise<{sessionData: String, encryptionKey: Uint8Array}>}
 */
export async function parseSessionData(sessionKey) {
    const {uid, encryptionKey} = splitSessionKey(sessionKey)
    const sessionData = await storageProvider.getItem(uid)
    return {sessionData, encryptionKey}
}

/**
 * Restore implicit
 * @param {String} sessionKey
 * @return {DecryptedImplicitSession}
 */
export async function restoreImplicitSession(sessionKey) {
    const {sessionData, encryptionKey} = await parseSessionData(sessionKey)
    if (!sessionData) return
    const {encryptedSecret} = JSON.parse(sessionData),
        decrypted = decryptDataAes(encryptedSecret, encryptionKey)
    const session = JSON.parse(decrypted)
    if (isSessionExpired(session)) {
        //remove expired token
        await storageProvider.removeItem(splitSessionKey(sessionKey).uid)
        return
    }
    return session
}

function removeAccountImplicitSessions(account) {
    //TODO: Implement a method to cleanup all account sessions on logout
}

/**
 * Automatically clean up expired sessions every 60 seconds.
 * @return {Number} - Interval handler.
 */
export function scheduleCleanupExpiredSessions() {
    return setInterval(async function () {
        const keys = await storageProvider.enumerateKeys()
        //iterate through all sessions
        for (let key of keys) {
            if (key.indexOf(sessionPrefix) !== 0) continue
            const item = await storageProvider.getItem(key)
            if (item) {
                //parse data and check validity period
                const descriptor = JSON.parse(item)
                if (isSessionExpired(descriptor)) {
                    //remove expired
                    await storageProvider.removeItem(key)
                }
            }
        }
    }, 60000)
}