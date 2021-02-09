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
    async setActiveAccount(account) {
        this.activeAccount = account
        await updateRecentAccount(account)
        await syncLocalStorage()
    }

    /**
     * Load all accounts saved in browser localStorage.
     */
    @action
    async loadAvailableAccounts() {
        const accounts = await enumerateStoredAccounts()

        this.accounts = []
        for (let id of accounts) {
            const accountInfo = await loadAccountDataFromBrowserStorage(id)
            if (accountInfo) {
                this.accounts.push(new Account(accountInfo))
            }
        }
    }

    @action
    addAccount(account) {
        if (!(account instanceof Account)) throw new Error('Invalid account provided.')
        if (!this.accounts.some(a => a.id === account.id)) {
            this.accounts.push(account)
        }
    }

    async forget(account) {
        const pos = this.accounts.indexOf(account)
        if (pos >= 0) {
            this.accounts.splice(pos, 1)
        }
        await forgetAccount(account)
        if (this.activeAccount.id === account.id) {
            await this.setActiveAccount(this.accounts[0])
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
            await persistAccountInBrowser(account)
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

    async reload() {
        await this.loadAvailableAccounts()
        this.activeAccount = this.get(await retrieveRecentAccount()) || null
    }
}

const accountManager = new AccountManager()

export default accountManager
