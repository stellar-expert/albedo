import {Keypair, StrKey} from 'stellar-base'
import AccountKeypair from './account-keypair'

class AccountKeypairSensitiveData {
    constructor({secret, friendlyName}) {
        if (!secret || !StrKey.isValidEd25519SecretSeed(secret))
            throw new Error('Invalid secret key: ' + secret)
        this.secret = secret
        this.friendlyName = friendlyName
    }

    /**
     * {String}
     */
    secret

    /**
     * User-defined friendly name.
     * {String}
     */
    friendlyName

    get publicKey() {
        return Keypair.fromSecret(this.secret).publicKey()
    }

    /**
     * @returns {AccountKeypair}
     */
    createKeypairInfo(parentAccount) {
        return new AccountKeypair({
            publicKey: this.publicKey,
            friendlyName: this.friendlyName
        }, parentAccount)
    }

    /*validate() {
        if (!StrKey.isValidEd25519SecretSeed(this.secret)) return Promise.reject(errors.invalidSecretKey)
        return Promise.resolve(this)
    }*/

    toJSON() {
        return {
            secret: this.secret,
            friendlyName: this.friendlyName
        }
    }
}

export default AccountKeypairSensitiveData