import {
    generateRandomEncryptionKey,
    encryptDataAes,
    decryptDataAes,
    encodeBase64,
    decodeBase64
} from '../util/crypto-utils'

const sessionPrefix = 'session_'

/**
 * @typedef {Object} SessionDescriptor
 * @property {String} sessionKey
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
 * @return {{pubkey: String, sessionKey: String, validUntil: Number}}
 */
function saveImplicitSession(account, duration, data) {
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
    localStorage.setItem(uid, JSON.stringify(sessionData))
    return {
        sessionKey: encodeBase64(sessionKey),
        validUntil,
        pubkey: account.publicKey
    }
}

function parseSessionData(sessionKey) {
    const {uid, encryptionKey} = splitSessionKey(sessionKey)
    return {sessionData: localStorage.getItem(uid), encryptionKey}
}

/**
 *
 * @param {String} sessionKey
 * @return {Boolean|SessionDescriptor}
 */
function restoreImplicitSession(sessionKey) {
    const {sessionData, encryptionKey} = parseSessionData(sessionKey)
    if (!sessionData) return false
    const {encryptedSecret} = JSON.parse(sessionData),
        decrypted = decryptDataAes(encryptedSecret, encryptionKey)
    const session = JSON.parse(decrypted)
    if (isSessionExpired(session)) {
        //remove expired token
        localStorage.removeItem(uid)
        return false
    }
    return session
}

function removeAccountImplicitSessions(account) {
    //TODO: Implement a method to cleanup all account sessions on logout
}

/**
 * Automatically clean up expired sessions every 60 seconds.
 * @return {number} - Interval handler.
 */
function scheduleCleanupExpiredSessions() {
    return setInterval(function () {
        //iterate through all sessions
        for (let key of Object.keys(localStorage)) {
            if (key.indexOf(sessionPrefix) !== 0) continue
            const item = localStorage.getItem(key)
            if (item) {
                //parse data and check validity period
                const descriptor = JSON.parse(item)
                if (isSessionExpired(descriptor)) {
                    //remove expired
                    localStorage.removeItem(key)
                }
            }
        }
    }, 60000)
}

export {
    saveImplicitSession,
    parseSessionData,
    restoreImplicitSession,
    scheduleCleanupExpiredSessions
}