import ImplicitSession from './implicit-session'

const sessionStoragePrefix = 'albedo_session_'

class ImplicitSessionStorage {
    constructor() {
        this.implicitSessions = {}
        this.saveToBrowserStorage = true
    }

    /**
     * Whether to save the session to the browser internal session storage - allows sharing of session data
     * between multiple browser tabs but potentially is less secure than the local variable storage.
     * @type {boolean}
     */
    saveToBrowserStorage = false

    addSession(intentResult) {
        const session = new ImplicitSession(intentResult)
        if (!this.saveToBrowserStorage) {
            this.implicitSessions[session.pubkey] = session
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
    getImplicitSession(intent, pubkey) {
        let session
        if (!this.saveToBrowserStorage) {
            session = this.implicitSessions[pubkey]
        } else {
            const restored = window.sessionStorage.getItem(sessionStoragePrefix + pubkey)
            if (restored) {
                session = new ImplicitSession(JSON.parse(restored))
            }
        }
        if (!session) return null
        if (session.isExpired) {
            delete this.implicitSessions[pubkey]
            return null
        }
        if (!session.grants.includes(intent)) return null
        return session
    }
}

export default new ImplicitSessionStorage()