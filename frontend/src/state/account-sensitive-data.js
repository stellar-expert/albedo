import AccountKeypairSensitiveData from './account-keypair-sensitive-data'

class AccountSensitiveData {
    /**
     *
     * @param {Object} [params] - Sensitive account data.
     * @param {Array} [params.keypairs] - Sensitive account data.
     * @param {Object} [params.personalInfo] - Sensitive account data.
     */
    constructor(params) {
        const {keypairs, personalInfo, version} = params || {}
        this.keys = (keypairs || []).map(kp => new AccountKeypairSensitiveData(kp))
        this.personalInfo = personalInfo
        this.version = version
    }

    /**
     * @type {Object}
     */
    personalInfo

    /**
     * @type {Array<AccountKeypairSensitiveData>}
     */
    keys

    /**
     * Sequential sensitive data version. Included here to produce different data contents on each encryption cycle
     * preventing potential AES problems when encrypting different content with the same password and iv.
     * @type {Number}
     */
    version

    /**
     * Retrieve corresponding Stellar secret key for a given public key.
     * @param {String} publicKey
     * @returns {String}
     */
    getSecret(publicKey) {
        const key = this.keys.find(k => k.publicKey === publicKey)
        if (!key) return null
        return key.secret
    }

    /**
     * Add/modify a keypair.
     * @param {String} secret - Keypair secret key.
     * @param {String} [friendlyName] - Friendly display name for the keypair.
     */
    addOrUpdateKeypair({secret, friendlyName}) {
        const existing = this.keys.find(kp => kp.secret === secret)
        if (existing) {
            existing.friendlyName = friendlyName
        } else {
            //TODO: we can set limit on the overall encrypted data size instead
            if (this.keys.length >= 50) throw new Error('Reached limit of max 50 keypairs per account.')
            this.keys.push(new AccountKeypairSensitiveData({secret, friendlyName}))
        }
    }

    setVersion(version) {
        this.version = version
    }

    /**
     * Remove a keypair from the account.
     * @param {String} publicKey - Public key of the keypair to remove.
     */
    removeKeypair(publicKey) {
        const idx = this.keys.findIndex(k => k.publicKey === publicKey)
        if (idx >= 0) {
            this.keys.splice(idx, 1)
        }
    }

    toJSON() {
        return {
            personalInfo: this.personalInfo,
            keypairs: this.keys,
            version: this.version
        }
    }
}

export default AccountSensitiveData