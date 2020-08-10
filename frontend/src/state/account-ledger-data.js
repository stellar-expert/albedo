import {observable, action, runInAction, transaction} from 'mobx'
import {createHorizon} from '../util/horizon-connector'
import {Networks, Transaction} from 'stellar-sdk'
import Bignumber from 'bignumber.js'

const maxRecentEntries = 15

function retrieveOperations(tx, network) {
    const parsed = new Transaction(tx.envelope_xdr, Networks[network.toUpperCase()])
    tx.operations = parsed.operations.map((op, i) => {
        const opid = new Bignumber(tx.paging_token)
            .add(i + 1)
        op.id = opid.toString()
        return op
    })
    return tx
}

const defaultThresholds = {low: 1, med: 1, high: 1}
Object.freeze(defaultThresholds)

/**
 * On-chain account balances and activity.
 */
class AccountLedgerData {
    constructor(address, network) {
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
    @observable.shallow
    txHistory = []

    /**
     * Current account balances
     * @type {Array<{}>}
     */
    @observable.shallow
    balances = []

    /**
     * Account operation threshold settings
     * @type {{high: number, low: number, med: number}}
     */
    @observable
    thresholds = defaultThresholds

    /**
     * Account signers
     * @type {Array}
     */
    @observable.shallow
    signers = []

    @observable
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
                    this.nonExisting = false
                    this.balances = accountData.balances
                    this.thresholds = {
                        low: accountData.thresholds.low_threshold,
                        med: accountData.thresholds.med_threshold,
                        high: accountData.thresholds.high_threshold
                    }
                    this.signers = accountData.signers
                })
            })
            .catch(e => {
                let nonExisting = false
                if (e.name === 'NotFoundError') {
                    this.error = 'Account does not exist on the ledger'
                    nonExisting = true
                } else {
                    console.error(e)
                    this.error = 'Failed to load account data from Horizon'
                }
                transaction(() => {
                    this.nonExisting = nonExisting
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
    @action
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
    @action
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