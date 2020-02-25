class ImplicitSession {
    constructor({session, pubkey, grants, valid_until}) {
        this.key = session
        this.pubkey = pubkey
        this.grants = grants.slice()
        this.validUntil = valid_until
        //prevent accidental changes
        Object.freeze(this)
        Object.freeze(this.grants)
    }

    /**
     * Unique session key.
     * @type {String}
     */
    key = ''

    /**
     * Public key of the key pair used to authorize the session.
     * @type {String}
     */
    pubkey = ''

    /**
     * Granted permissions.
     * @type {Array<String>}
     */
    grants = []

    /**
     * Time-to-live.
     * @type {Number}
     */
    validUntil = 0

    /**
     * Check whether the session is expired or not.
     * @return {boolean}
     */
    get isExpired() {
        //2 seconds reserve
        return this.validUntil - 2000 < new Date().getTime()
    }

    toJSON() {
        return {
            session: this.key,
            pubkey: this.pubkey,
            grants: this.grants.slice(),
            valid_until: this.validUntil
        }
    }
}

export default ImplicitSession