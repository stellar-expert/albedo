import {observable, computed} from 'mobx'
import {StrKey, Keypair} from 'stellar-base'
import errors from '../util/errors'
import {formatAddress} from '../util/formatter'

/**
 * Stellar account key pair wrapper.
 */
class AccountKeypair {
    /**
     * Create new instance of AccountKeypair.
     * @param {Object} [serialized] - Plain object containing key pair details.
     * @param {String} [serialized.publicKey] - Keypair public key.
     * @param {String} [serialized.friendlyName] - Friendly name defined by user.
     * @param {String} [serialized.path] - BIP-32 derivation path (only for hardware wallets).
     */
    constructor(serialized, parentAccount) {
        if (serialized) {
            this.publicKey = serialized.publicKey
            this.friendlyName = serialized.friendlyName
            this.path = serialized.path
        }
        if (parentAccount) {
            this.account = parentAccount
        }
    }

    //TODO: make publicKey readonly
    /**
     * Stellar account public key.
     * @returns {String}
     */
    publicKey = null

    /**
     * Parent account reference.
     * @type {Account}
     */
    account = null

    /**
     * User-defined friendly name.
     * @type {String}
     */
    @observable
    friendlyName = null

    /**
     * BIP-32 derivation path (only for hardware wallets)
     * @type {String}
     */
    path = null

    /**
     * Title to display in UI.
     * @returns {String}
     */
    @computed
    get displayName() {
        if (this.friendlyName) return `${this.friendlyName} (${formatAddress(this.publicKey, 8)})`
        if (this.path) return `${this.path} (${formatAddress(this.publicKey, 8)})`
        return formatAddress(this.publicKey, 16)
    }

    /**
     * Prepare data for the serialization.
     * @return {Object}
     */
    toJSON() {
        return {
            publicKey: this.publicKey,
            friendlyName: this.friendlyName,
            path: this.path
        }
    }
}

export default AccountKeypair