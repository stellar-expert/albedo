import {Keypair} from '@stellar/stellar-base'
import shajs from 'sha.js'
import isEqual from 'react-fast-compare'
import {ACCOUNT_TYPES} from '../state/account'

export default class ActionAuthenticationContext {
    /**
     * Create new instance of AccountActionsWrapper for a given account.
     * @param {Account} account - Account to use.
     * @return {ActionAuthenticationContext}
     */
    static forAccount(account) {
        const res = new ActionAuthenticationContext()
        res.account = account
        res.publicKey = account.publicKey
        if (account.secret) {
            res.secret = account.secret
        }
        return res
    }

    /**
     * Account to use for signing.
     * @type {Account}
     */
    account = null

    /**
     * Public key of the keypair that should be used for signing.
     * @type {String}
     */
    publicKey = ''

    /**
     * Secret key (only if case of direct key input or restored implicit session)
     * @type {String}
     */
    secret = ''

    /**
     * Credentials selected for current action.
     * @type {Credentials}
     */
    credentials = null

    /**
     *
     * @param {String} message
     * @param {Boolean} isBinary
     * @return {Promise<{signature: Buffer, signedMessage: Buffer}>}
     */
    async signMessage(message, isBinary) {
        let keypair
        if (this.secret) { //direct secret key input or implicit session
            keypair = Keypair.fromSecret(this.secret)
        } else if (this.account.isStoredAccount) { //stored account
            keypair = await this.getStoredKeypair()
        } else
            throw new Error('Unsupported account type:' + this.account.accountType)
        return {
            ...this.signAlbedo(keypair, message),
            ...this.signSep53(keypair, message, isBinary)
        }
    }

    async signTransaction(transaction) {
        //save existing transaction signatures
        const existingSignatures = [...transaction.signatures]
        if (this.secret) { //direct secret key input or implicit session
            transaction.sign(Keypair.fromSecret(this.secret))
        } else if (this.account.isStoredAccount) { //stored account
            transaction.sign(await this.getStoredKeypair())
        }
        let newSignature = null
        //find new signature and return it
        for (let sig of transaction.signatures.slice()) {
            //remove duplicates
            while (transaction.signatures.filter(s => isEqual(s.signature(), sig.signature())).length > 1) {
                const idx = transaction.signatures.findIndex(s => isEqual(s.signature(), sig.signature()))
                transaction.signatures.splice(idx, 1)
            }
            //check whether it's a new signature
            if (!existingSignatures.includes(sig)) {
                newSignature = sig
            }
        }
        return newSignature
    }

    async getStoredKeypair() {
        //use stored account for signing
        const secret = this.account.requestAccountSecret(this.credentials)
        if (!secret) throw new Error(`Failed to retrieve a secret key for stored account.`)
        return Keypair.fromSecret(secret)
    }

    async retrieveSessionData() {
        const res = {
            accountType: this.account.accountType,
            publicKey: this.publicKey
        }

        if (res.accountType === ACCOUNT_TYPES.STORED_ACCOUNT) {
            res.secret = this.account.requestAccountSecret(this.credentials)
        } else if (this.secret) {
            res.secret = this.secret
        }
        return res
    }

    /**
     * @param {Keypair} keypair
     * @param {String} message
     * @param {Boolean} [isBinary]
     * @return {Promise<{signature: Buffer, signedMessage: Buffer}>}
     * @private
     */
    signAlbedo(keypair, message, isBinary) {
        const messageToSign = `${this.publicKey}:${message}`
        const rawMessage = shajs('sha256').update(messageToSign).digest()
        const signature = keypair.sign(rawMessage)
        return {
            signature,
            albedoSignatureBase: messageToSign
        }
    }

    /**
     * @param {Keypair} keypair
     * @param {String} message
     * @param {Boolean} [isBinary]
     * @return {Promise<{signature: Buffer, signedMessage: Buffer}>}
     * @private
     */
    signSep53(keypair, message, isBinary) {
        const prefix = Buffer.from('Stellar Signed Message:\n', 'utf8')
        const messageToSign = Buffer.concat([prefix, Buffer.from(message, isBinary ? 'hex' : 'utf8')])
        const rawMessage = shajs('sha256').update(messageToSign).digest()
        const signature = keypair.sign(rawMessage)
        return {
            signedMessage: signature
        }
    }
}
