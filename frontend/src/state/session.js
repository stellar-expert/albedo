class Session {

    /**
     * Unique session ID.
     * @type {String}
     */
    id

    /**
     * Encrypted sensitive data.
     * @type {String}
     */
    data

    /**
     * Implicit session flag.
     * @type {Boolean}
     */
    implicit = false

    /**
     * Prepare session data for serialization.
     * @return {Object}
     */
    toJSON() {
        const {id, data, implicit} = this
        return {
            id,
            data,
            implicit
        }
    }
}

export default Session