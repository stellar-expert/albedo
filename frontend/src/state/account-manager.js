import {observable, action} from 'mobx'
import Account, {ACCOUNT_TYPES} from './account'
import {
    enumerateStoredAccounts,
    loadAccountDataFromBrowserStorage,
    persistAccountInBrowser,
    forgetAccount,
    updateRecentAccount,
    retrieveRecentAccount
} from '../storage/account-storage'
import {syncLocalStorage} from '../actions/callback-dispatcher'

class AccountManager {
    constructor() {
        this.reload()
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
     * All accounts saved to browser localStorage.
     * @type {Account[]}
     */
    @observable.shallow
    accounts = []

    /**
     * Find account persisted in browser storage by an id
     * @param id
     * @returns {Account|null}
     */
    get(id) {
        if (!id) return null
        return this.accounts.find(a => a.id === id)
    }

    @action
    setActiveAccount(account) {
        this.activeAccount = account
        updateRecentAccount(account)
        syncLocalStorage()
    }

    /**
     * Load all accounts saved in browser localStorage.
     */
    @action
    loadAvailableAccounts() {
        //console.log('Enumerating accounts', Object.keys(storageAbstraction.storage))
        this.accounts = enumerateStoredAccounts()
            .map(id => loadAccountDataFromBrowserStorage(id))
            .filter(a => !!a)
            .map(a => new Account(a))
    }

    @action
    addAccount(account) {
        if (!(account instanceof Account)) throw new Error('Invalid account provided.')
        if (!this.accounts.some(a => a.id === account.id)) {
            this.accounts.push(account)
        }
    }

    forget(account) {
        const pos = this.accounts.indexOf(account)
        if (pos >= 0) {
            this.accounts.splice(pos, 1)
        }
        forgetAccount(account)
        if (this.activeAccount.id === account.id) {
            this.setActiveAccount(this.accounts[0])
        }
    }

    async loginHWAccount({id, publicKey, path, type}) {
        const accountId = id || publicKey
        let account = this.get(accountId)
        let shouldUpdate = false
        if (!account) {
            account = new Account({
                id: accountId,
                accountType: type,
                path,
                publicKey
            })
            shouldUpdate = true
        }
        if (shouldUpdate) {
            persistAccountInBrowser(account)
        }
        return account
    }

    findSuitableFriendlyName() {
        const n = this.accounts
            .map(a => (/account\s?(\d+)/i.exec(a.friendlyName) || [])[1])
            .filter(name => !!name)
            .map(name => parseInt(name))
        if (!n.length) {
            if (this.accounts.some(a => a.accountType === ACCOUNT_TYPES.STORED_ACCOUNT)) return 'Account 1'
            return 'Default Account'
        }
        n.sort()
        return 'Account ' + (1 + n.pop())
    }

    reload() {
        this.loadAvailableAccounts()
        this.activeAccount = this.get(retrieveRecentAccount()) || null
    }
}

const manager = new AccountManager()

export default manager
