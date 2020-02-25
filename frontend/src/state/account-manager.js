import {observable, action, transaction} from 'mobx'
import Account from './account'
import AccountKeypair from './account-keypair'
import {
    enumerateStoredAccounts,
    loadAccountDataFromBrowserStorage,
    persistAccountInBrowser,
    eraseAccountInBrowser,
    updateRecentAccount,
    retrieveRecentAccount
} from '../storage/account-storage'

class AccountManager {
    constructor() {
        this.loadAvailableAccounts()
        const recent = this.get(retrieveRecentAccount())
        if (recent) {
            this.activeAccount = recent
        }
    }

    /**
     * Find account persisted in browser storage by an id
     * @param id
     * @returns {Account|null}
     */
    get(id) {
        if (!id) return null
        return this.accounts.find(a => a.id === id)
    }

    /**
     * Whether account selector menu is open or not.
     * @type {boolean}
     */
    @observable
    selectorVisible = false

    /**
     * Currently selected account.
     * @type {Account}
     */
    @observable
    activeAccount = null

    /**
     * Currently selected keypair.
     * @type {AccountKeypair}
     */
    @observable
    selectedKeypair = null

    /**
     * All accounts saved to browser localStorage.
     * @type {Account[]}
     */
    @observable.shallow
    accounts = []

    @observable
    directKeyInput = false

    @action
    setActiveAccount(account) {
        this.activeAccount = account
        updateRecentAccount(account)
    }

    /**
     * Update selected keypair.
     * @param {AccountKeypair} keypair - Selected keypair.
     */
    @action
    setSelectedKeypair(keypair) {
        if (!(keypair instanceof AccountKeypair)) throw new TypeError('Invalid keypair.')
        this.setActiveAccount(keypair.account)
        this.selectedKeypair = keypair
    }

    /**
     * Load all accounts saved in browser localStorage.
     */
    @action
    loadAvailableAccounts() {
        this.accounts = enumerateStoredAccounts()
            .map(id => new Account(loadAccountDataFromBrowserStorage(id)))
        //this.createDemoAccount()
        //.catch(e => console.error(e))
    }

    @action
    addAccount(account) {
        if (!(account instanceof Account)) throw new Error('Invalid account provided.')
        const i = this.accounts.findIndex(a => a.id === account.id)
        if (i >= 0) {
            //replace existing account
            this.accounts.splice(i, 1, account)
            //TODO: check the existing account properties and merge them
        } else {
            this.accounts.push(account)
        }
    }

    signOut(account) {
        const pos = this.accounts.indexOf(account)
        if (pos >= 0) {
            this.accounts.splice(pos, 1)
        }
        eraseAccountInBrowser(account)
        if (this.activeAccount === account) {
            this.setActiveAccount(this.accounts[0])
        }
    }

    async loginHWAccount({id, publicKey, path, type}) {
        const accountId = id || publicKey
        let account = this.get(accountId)
        let shouldUpdate = false
        if (!account) {
            account = new Account({id: accountId, accountType: type})
            shouldUpdate = true
        }

        const keypair = new AccountKeypair({path, publicKey}, account)
        if (account.addKeypair(keypair)) {
            shouldUpdate = true
        }
        if (shouldUpdate) {
            persistAccountInBrowser(account)
        }
        return account
    }

    /**
     * Create demo account if it does not exist and unlock it permanently.
     * @returns {Promise<Account>}
     */

    /*@action
    createDemoAccount() {
        const demoEmail = 'demo@demo.com'
        let existingDemoAccount = this.get(demoEmail)
        if (existingDemoAccount) {
            if (existingDemoAccount.isDecrypted) return Promise.resolve(existingDemoAccount) //everything ok
            //something went wrong, have to recreate it
            deleteAccount(existingDemoAccount)
            this.accounts = this.accounts.filter(a => a !== existingDemoAccount)
        }

        let pwd = Math.random().toString(36).slice(2)
        return Account.create(demoEmail, pwd)
            .then(demoAccount => {
                return demoAccount.addKeypair(new AccountKeypair({
                    secret: 'SCDQNBXV6WSAUCVNYQCD6NAXL7S2ROG2DSHHEBLKIGKQPYWUIUAYIO7T',
                    friendlyName: 'Demo account'
                }))
                    .then(() => demoAccount.save())
                    .then(() => demoAccount.unlock(pwd, 100000000000))
                    .then(() => this.accounts.push(demoAccount))
                    .then(() => demoAccount)
            })
    }*/
}

const manager = new AccountManager()

export default manager
