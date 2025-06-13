import ImplicitSession from './implicit-session.js'

const storagePrefix = 'albedo_session_',
    implicitSessions = {}

function getStorage() {
    return window.sessionStorage
}

/**
 * Whether to save the session to the browser internal session storage - allows sharing of session data
 * between multiple browser tabs but potentially is less secure than the local variable storage.
 * @type {boolean}
 */
const saveToBrowserStorage = true

export function saveImplicitSession(intentResult) {
    const session = new ImplicitSession(intentResult)
    if (!saveToBrowserStorage) {
        implicitSessions[session.pubkey] = session
    } else {
        getStorage().setItem(storagePrefix + session.pubkey, JSON.stringify(session))
    }
}

function retrieveSessionFromStorage(pubkey) {
    let session
    if (!saveToBrowserStorage) {
        session = implicitSessions[pubkey]
    } else {
        const restored = getStorage().getItem(storagePrefix + pubkey)
        if (restored) {
            session = new ImplicitSession(JSON.parse(restored))
        }
    }
    if (!session) return null
    if (session.isExpired) {
        forgetSession(pubkey)
        return null
    }
    return session
}

/**
 * Find active implicit session by intent and pubkey.
 * @param {String} intent - Intent code.
 * @param {String} pubkey - Public key associated with the session.
 * @return {ImplicitSession|null}
 */
export function getImplicitSession(intent, pubkey) {
    const session = retrieveSessionFromStorage(pubkey)
    if (!session || !session.grants.includes(intent)) return null
    return session
}

/**
 * Retrieve all active sessions.
 * @return {Array<ImplicitSession>}
 */
export function getAllImplicitSessions() {
    const storage = getStorage()
    return Object.keys(storage)
        .filter(key => key.indexOf(storagePrefix) === 0)
        .map(key => retrieveSessionFromStorage(key.substr(storagePrefix.length)))
        .filter(session => !!session)
}

/**
 * Remove an explicit session handler from the storage.
 * @param {String} pubkey - Public key associated with the session.
 */
export function forgetSession(pubkey) {
    if (!saveToBrowserStorage) {
        delete implicitSessions[pubkey]
    } else {
        getStorage().removeItem(storagePrefix + pubkey)
    }
}