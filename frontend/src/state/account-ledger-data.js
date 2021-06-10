import {observable, action, runInAction, transaction, makeObservable} from 'mobx'
import {createHorizon} from '../util/horizon-connector'
import {Networks, Transaction, TransactionBuilder} from 'stellar-sdk'
import Bignumber from 'bignumber.js'

const maxRecentEntries = 15

function retrieveOperations(tx, network) {
    let parsed = TransactionBuilder.fromXDR(tx.envelope_xdr, Networks[network.toUpperCase()])
    //handle fee bumps
    if (parsed.innerTransaction) {
        parsed = parsed.innerTransaction
    }
    if (parsed.operations) {
        tx.operations = parsed.operations.map((op, i) => {
            const opid = new Bignumber(tx.paging_token)
                .add(i + 1)
            op.id = opid.toString()
            return op
        })
    } else {
        tx.operations = []
    }
    return tx
}

const defaultThresholds = {low: 1, med: 1, high: 1}
Object.freeze(defaultThresholds)

/**
 * On-chain account balances and activity.
 */
class AccountLedgerData {
    constructor(address, network) {
        makeObservable(this, {
            txHistory: observable.shallow,
            balances: observable.shallow,
            thresholds: observable,
            signers: observable.shallow,
            error: observable,
            loadHistoryNextPage: action,
            startHistoryStreaming: action
        })

        this.address = address
        this.network = network
    }

    /**
     * Stellar account public key
     * @type {String}
     */
    address = ''

    /**
     * Stelalr network identifier
     * @type {'public'|'testnet'}
     */
    network = 'public'

    /**
     * Transactions history for current account
     * @type {Array<Transaction>}
     */
    txHistory = []

    /**
     * Current account balances
     * @type {Array<{}>}
     */
    balances = []

    /**
     * Account operation threshold settings
     * @type {{high: number, low: number, med: number}}
     */
    thresholds = defaultThresholds

    /**
     * Account signers
     * @type {Array}
     */
    signers = []

    error

    nonExisting = false

    /**
     * Current tx history cursor
     * @return {String|null}
     */
    get txHistoryCursor() {
        const history = this.txHistory
        return history.length ? history[history.length - 1].paging_token : null
    }

    #historyLoadingNextPage = null

    #finalizeHistoryStream = null

    /**
     * Load general account info from the ledger
     */
    loadAccountInfo() {
        const horizon = createHorizon({network: this.network})
        horizon.loadAccount(this.address)
            .then(accountData => {
                transaction(() => {
                    const {balances} = accountData
                    //sort balances
                    const [xlmBalance] = balances.splice(balances.findIndex(b => b.asset_type === 'native'), 1)
                    accountData.balances.sort((a, b) => {
                        if (a.balance == 0 && b.balance > 0) return 1
                        if (b.balance == 0 && a.balance > 0) return -1
                        if (a.asset_code === b.asset_code) return a.balance - b.balance
                        return (a.asset_code > b.asset_code) ? 1 : (a.asset_code < b.asset_code) ? -1 : 0
                    })
                    this.balances = [xlmBalance, ...accountData.balances]
                    this.thresholds = {
                        low: accountData.thresholds.low_threshold,
                        med: accountData.thresholds.med_threshold,
                        high: accountData.thresholds.high_threshold
                    }
                    this.signers = accountData.signers
                    this.nonExisting = false
                })
            })
            .catch(e => {
                let nonExisting = false,
                    error
                if (e.name === 'NotFoundError') {
                    error = 'Account does not exist on the ledger'
                    nonExisting = true
                } else {
                    console.error(e)
                    error = 'Failed to load account data from Horizon'
                }
                transaction(() => {
                    this.nonExisting = nonExisting
                    this.error = error
                    this.balances = []
                    this.thresholds = defaultThresholds
                    this.signers = []
                })
            })
    }

    /**
     * Load transactions history
     * @param {Boolean} [forceRefresh] - Whether to reset current ops history or not
     * @return {Promise}
     */
    loadHistoryNextPage(forceRefresh = false) {
        if (!this.#historyLoadingNextPage) {
            const cursor = forceRefresh ? null : this.txHistoryCursor
            this.#historyLoadingNextPage = createHorizon({network: this.network})
                .transactions()
                .forAccount(this.address)
                .limit(maxRecentEntries)
                .order('desc')
                .cursor(cursor)
                .call()
                .then(data => {
                    const newBatch = data.records.map(tx => retrieveOperations(tx, this.network))
                    runInAction(() => {
                        if (forceRefresh) {
                            this.txHistory.replace(newBatch)
                        } else {
                            this.txHistory.replace([...(this.txHistory || []), ...newBatch])
                        }
                    })
                    return newBatch
                })
                .catch(e => {
                    if (e.name === 'NotFoundError') {
                        this.txHistory = []
                    } else {
                        console.error(e)
                    }
                })
                .finally(() => {
                    this.#historyLoadingNextPage = false
                })
        }
        return this.#historyLoadingNextPage
    }

    /**
     * Stream transactions history from Horizon
     */
    startHistoryStreaming() {
        if (this.#finalizeHistoryStream) return
        this.loadHistoryNextPage(true)
            .then(() => {
                this.stopHistoryStreaming()
                const cursor = this.txHistory[0]?.paging_token || null
                this.#finalizeHistoryStream = createHorizon({network: this.network})
                    .transactions()
                    .forAccount(this.address)
                    .limit(maxRecentEntries)
                    .order('asc')
                    .cursor(cursor)
                    .stream({
                        onmessage: tx => {
                            retrieveOperations(tx, this.network)
                            const newHistory = [tx, ...this.txHistory]
                            while (newHistory.length > maxRecentEntries) {
                                newHistory.pop()
                            }
                            this.txHistory.replace(newHistory)
                            this.loadAccountInfo()
                        },
                        reconnectTimeout: 60000
                    })
            })
    }

    /**
     * Stop history streaming
     */
    stopHistoryStreaming() {
        if (this.#finalizeHistoryStream) {
            this.#finalizeHistoryStream()
            this.#finalizeHistoryStream = null
        }
    }

    init() {
        this.loadAccountInfo()
    }

    /**
     * Stop pulling data from Horizon and free all resources
     */
    finalize() {
        this.stopHistoryStreaming()
    }
}

export default AccountLedgerData