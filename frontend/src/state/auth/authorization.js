import {observable, action, runInAction, makeObservable} from 'mobx'
import {navigation} from '@stellar-expert/ui-framework'
import {
    getCredentialsFromExtensionStorage,
    saveCredentialsInExtensionStorage
} from '../../storage/extension-auth-storage-interface'
import Credentials from './credentials'
import standardErrors from '../../util/errors'

const defaultSessionTimeout = 600 // 10 minutes

class AuthorizationService {
    constructor() {
        makeObservable(this, {
            dialogOpen: observable,
            reset: action,
            requestAuthorization: action
        })
        this.sessions = {}

        setTimeout(() => { //TODO: address the loading sequence problem and rewrite this dirty hack
            navigation.history.listen((location, action) => {
                this.dialogOpen = false // hide auth dialog when navigation occurred
            })
        }, 200)

        setInterval(() => {
            const now = new Date().getTime()
            for (let key of Object.keys(this.sessions))
                if (this.sessions[key].expires < now) {
                    delete this.sessions[key]
                }
        }, 5000)
    }

    dialogOpen = false

    account = null

    credentialsRequestCallback = null

    sessions

    reset() {
        this.dialogOpen = false
        this.account = null
        this.credentialsRequestCallback = null
    }

    /**
     * Request action authorization from the user.
     * @param {Account} account - Current account to obtain credentials
     * @param {Boolean} [forceCredentialsRequest] - Ensures password prompt in security-critical cases
     * @return {Promise<Credentials>}
     */
    requestAuthorization(account, forceCredentialsRequest = false) {
        const session = this.sessions[account.id]
        if (session) return Promise.resolve(session.credentials)

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
                            //temporary store session locally
                            if (account.sessionTimeout !== 0) {
                                this.sessions[account.id] = {
                                    credentials,
                                    expires: new Date().getTime() + (account.sessionTimeout || defaultSessionTimeout) * 1000
                                }
                            }
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