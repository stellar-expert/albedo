import {generateRandomEncryptionKey, encryptDataAes, decryptDataAes, encodeBase64} from '../util/crypto-utils'

const sessionPrefix = 'session_'

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
 * Save implicit session record for the account. The session key contains only a temporary random key that allows
 * to decipher session on the client side.
 * @param {Account} account - Account to save.
 * @param {Number|String} duration - Implicit session duration in seconds.
 * @param {Object} data - Extra data to encrypt.
 * @return {{sessionKey: String, validUntil: Number}}
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

    const sessionKey = generateRandomEncryptionKey(),
        validUntil = new Date().getTime() + duration * 1000,
        dataToEncrypt = {
            email: account.email,
            validUntil,
            ...data
        },
        encryptedData = encryptDataAes(JSON.stringify(dataToEncrypt), sessionKey),
        sessionData = {
            validUntil, //we save validUntil in both encrypted and open part intentionally to prevent possible session extension attacks
            encryptedData
        }
    localStorage.setItem(sessionPrefix + sessionKey.substr(0, 10), JSON.stringify(sessionData))
    return {
        sessionKey,
        validUntil
    }
}

/**
 *
 * @param {String} sessionKey
 * @return {Boolean|SessionDescriptor}
 */
function restoreImplicitSession(sessionKey) {
    const itemKey = sessionPrefix + sessionKey.substr(0, 10),
        sessionData = localStorage.getItem(itemKey)
    if (!sessionData) return false
    const {encryptedData} = JSON.parse(sessionData),
        decrypted = decryptDataAes(encryptedData, sessionKey)
    const session = JSON.parse(decrypted)
    if (isSessionExpired(session)) {
        //remove expired token
        localStorage.removeItem(itemKey)
        return false
    }
    return session
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
    restoreImplicitSession,
    scheduleCleanupExpiredSessions
}