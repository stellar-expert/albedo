import {observable, action, runInAction, makeObservable} from 'mobx'
import {navigation} from '@stellar-expert/navigation'
import {getCredentialsFromExtensionStorage, saveCredentialsInExtensionStorage} from '../../storage/extension-auth-storage-interface'
import standardErrors from '../../util/errors'
import workerBuilder from '../../util/webworker-builder'
import worker from './auth-worker'
import Credentials from './credentials'

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

    authWorker = workerBuilder(worker)

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
    async requestAuthorization(account, forceCredentialsRequest = false) {
        const credentials = await this.getCredentialsFromWebWorker(account)
        if (credentials) return Promise.resolve(credentials)

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
                            this.myWorker.postMessage({
                                action: 'setCredentials',
                                payload: credentials
                            })
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

    async getCredentialsFromWebWorker(account) {
        this.authWorker.postMessage({
            action: 'getCredentials',
            payload: account
        })
        const answer = new Promise((resolve) => {
            this.authWorker.onmessage = function(mess) {
                resolve(mess.data.credentials)
            }
        })
        return await answer
    }
}

const authorizationService = new AuthorizationService()
export default authorizationService