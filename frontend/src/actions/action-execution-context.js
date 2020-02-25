import {Keypair} from 'stellar-base'
import shajs from 'sha.js'
import Account, {ACCOUNT_TYPES} from '../state/account'
import HwSigner from '../util/hw-signer/hw-signer'
import appSettings from '../app-settings'

class ActionExecutionContext {
    /**
     * Create new instance of AccountActionsWrapper for a given account.
     * @param {Account} account - Account to use.
     * @param {String} publicKey - Public key of the selected key pair.
     * @return {ActionExecutionContext}
     */
    static forAccount(account, publicKey) {
        const res = new ActionExecutionContext()
        res.account = account
        res.publicKey = publicKey
        if (account.isHWAccount) {
            res.hwSigner = new HwSigner(account.accountType)
        }
        return res
    }

    /**
     * Create new instance of AccountActionsWrapper from secret key (direct key input or restored implicit session).
     * @param {String} secret - Secret key to use.
     * @return {ActionExecutionContext}
     */
    static forSecret(secret) {
        const res = new ActionExecutionContext()
        res.secret = secret
        res.publicKey = Keypair.fromSecret(secret).publicKey()
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

    hwSigner = null

    /**
     *
     * @param {String} message
     * @return {Promise<{signature: Buffer, signedMessage: Buffer}>}
     */
    async signMessage(message) {
        const messageToSign = `${this.publicKey}:${message}`,
            rawMessage = shajs('sha256').update(messageToSign).digest()
        let signature
        if (this.secret) { //direct secret key input or implicit session
            signature = Keypair.fromSecret(this.secret).sign(rawMessage)
        } else if (this.account.isStoredAccount) { //stored account
            signature = (await this.getStoredKeypair()).sign(rawMessage)
        } else if (this.account.isHWAccount) { //hardware wallet
            const kp = await this.getHWSignerKeypair()
            signature = await this.hwSigner.signMessage({
                path: kp.path,
                publicKey: this.publicKey,
                message: rawMessage
            })
        } else throw new Error('Unsupported account type:' + this.account.accountType)
        return {
            signature,
            signedMessage: messageToSign
        }
    }

    async signTransaction(transaction) {
        //save existing transaction signatures
        const existingSignatures = [...transaction.signatures]
        if (this.secret) { //direct secret key input or implicit session
            transaction.sign(Keypair.fromSecret(this.secret))
        } else if (this.account.isStoredAccount) { //stored account
            transaction.sign(await this.getStoredKeypair())
        } else if (this.account.isHWAccount) { //hardware wallet
            const kp = await this.getHWSignerKeypair()
            await this.hwSigner.signTransaction({
                path: kp.path,
                publicKey: this.publicKey,
                transaction
            })
        }
        //find new signature and return it
        for (let sig of transaction.signatures) {
            if (!existingSignatures.includes(sig)) return sig
        }
        return null
    }

    async getStoredKeypair() {
        //use stored account for signing
        const sensitiveData = this.account.requestSensitiveData(this.credentials),
            secret = sensitiveData.getSecret(this.publicKey)
        if (!secret) throw new Error(`Failed to retrieve a secret key for stored account.`)
        return Keypair.fromSecret(secret)
    }

    async getHWSignerKeypair() {
        //sign with HW wallet
        const kp = this.account.keypairs.find(kp => kp.publicKey === this.publicKey)
        if (!kp) throw new Error(`Failed to retrieve a corresponding key pair from the hardware wallet account.`)
        await this.hwSigner.init({
            appManifest: {
                email: appSettings.appManifest.email,
                appUrl: appSettings.appManifest.appUrl
            }
        })
        return kp
    }

    async retrieveSessionData() {
        if (this.account.accountType !== ACCOUNT_TYPES.STORED_ACCOUNT)
            return {accountType: this.account.accountType}

        const sensitiveData = this.account.requestSensitiveData(this.credentials),
            secret = sensitiveData.getSecret(this.publicKey)
        return {
            accountType: ACCOUNT_TYPES.STORED_ACCOUNT,
            publicKey: this.publicKey,
            secret
        }
    }
}

export default ActionExecutionContext
