import ImplicitSession from './implicit-session'

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

/**
 * Find active implicit session by intent and pubkey.
 * @param {String} intent - Intent code.
 * @param {String} pubkey - Public key associated with the session.
 * @return {ImplicitSession|null}
 */
export function getImplicitSession(intent, pubkey) {
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
        delete implicitSessions[pubkey]
        return null
    }
    if (!session.grants.includes(intent)) return null
    return session
}

export function getAllImplicitSessions() {
    const storage = getStorage()
    return Object.keys(storage).map(key => storage.getItem(key))
}

export function forgetSession(pubkey) {
    getStorage().removeItem(storagePrefix + pubkey)
}