import {getCredentialsFromExtensionStorage, saveCredentialsInExtensionStorage} from '../storage/extension-auth-storage-interface'
import Credentials from './credentials'
import standardErrors from '../util/errors'
import {observable, action, runInAction} from 'mobx'

class AuthorizationService {
    constructor() {
        setTimeout(() => { //TODO: address the loading sequence problem and rewrite this dirty hack
            __history.listen((location, action) => {
                this.dialogOpen = false // hide auth dialog when navigation occurred
            })
        }, 200)
    }

    @observable
    dialogOpen = false

    account = null

    credentialsRequestCallback = null

    @action
    reset() {
        this.dialogOpen = false
        this.account = null
        this.credentialsRequestCallback = null
    }

    /**
     * Request action authorization from the user.
     * @param {Account} account
     * @return {Promise<Credentials>}
     */
    @action
    requestAuthorization(account) {
        return getCredentialsFromExtensionStorage(account.id)
            .catch(e => {
                e && console.error(e)
            })
            .then(encryptionKey => {
                if (encryptionKey) return Credentials.create({account, encryptionKey})
                //no corresponding key found in extension storage - show interactive user request prompt
                return new Promise((resolve, reject) => {
                    this.credentialsRequestCallback = {resolve, reject}
                    this.account = account
                    runInAction(() => {
                        this.dialogOpen = true
                    })
                })
                    .then(credentials => {
                        try {
                            credentials.account.requestAccountSecret(credentials)
                            saveCredentialsInExtensionStorage(credentials)
                        } catch (e) {
                            return Promise.reject(standardErrors.invalidPassword)
                        }
                        this.reset()
                        return credentials
                    })
                    .catch(e => {
                        console.error(e)
                        this.reset()
                        return Promise.reject(e)
                    })
            })
    }
}

const authorizationService = new AuthorizationService()
export default authorizationService