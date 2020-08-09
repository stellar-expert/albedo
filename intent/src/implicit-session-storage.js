import ImplicitSession from './implicit-session'

const sessionStoragePrefix = 'albedo_session_'

const implicitSessions = {}

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
        window.sessionStorage.setItem(sessionStoragePrefix + session.pubkey, JSON.stringify(session))
    }
}

/**
 * Find active implicit session by intent and pubkey.
 * @param {String} intent - Intent code.
 * @param {String} pubkey - Public key associated with the session.
 * @return {ImplicitSession|null}
 */
export function getImplicitSession (intent, pubkey) {
    let session
    if (!saveToBrowserStorage) {
        session = implicitSessions[pubkey]
    } else {
        const restored = window.sessionStorage.getItem(sessionStoragePrefix + pubkey)
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