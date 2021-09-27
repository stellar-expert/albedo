import {action, makeObservable, observable, runInAction} from 'mobx'
import {createHorizon} from '../../util/horizon-connector'
import {retrieveOperations} from './tx-operations'

export default class AccountTransactionHistory {
    constructor(network, address) {
        this.address = address
        this.network = network
        this.records = []
        makeObservable(this, {
            records: observable,
            loadNextPage: action,
            startStreaming: action,
            addInProgressTx: action,
            addNewTx: action,
            removeInProgressTx: action
        })
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
    records = []

    maxRecentEntries = 15

    loadingNextPagePromise = null

    finalizeStream = null

    /**
     * Load transactions history
     * @return {Promise}
     */
    loadNextPage() {
        if (!this.loadingNextPagePromise) {
            //extract paging token from the last available history record
            const cursor = this.records.length ? this.records[this.records.length - 1].paging_token : null
            this.loadingNextPagePromise = loadAccountTransactions({
                network: this.network,
                address: this.address,
                cursor
            })
                .then(newBatch => {
                    runInAction(() => {
                        this.removeInProgressTx(newBatch)
                        this.records.replace([...this.records, ...newBatch])
                    })
                    return newBatch
                })
                .catch(e => {
                    if (e.name !== 'NotFoundError') {
                        console.error(e)
                    }
                })
                .finally(() => {
                    this.loadingNextPagePromise = null
                })
        }
        return this.loadingNextPagePromise
    }

    /**
     * Stream transactions history from Horizon
     */
    async startStreaming() {
        if (this.finalizeStream) return
        if (!this.records.length) {
            await this.loadNextPage()
        }

        this.stopStreaming()
        this.finalizeStream = streamAccountTransactions({
            network: this.network,
            address: this.address,
            includeFailed: true,
            cursor: this.records[0]?.paging_token,
            onNewTx: tx => this.addNewTx(tx)
        })
    }

    /**
     * Stop history streaming
     */
    stopStreaming() {
        if (this.finalizeStream) {
            this.finalizeStream()
            this.finalizeStream = null
        }
    }

    /**
     * Add a recently submitted tx to the history with the InProgress flag
     * @param {Transaction} tx
     */
    addInProgressTx(tx) {
        retrieveOperations(tx, this.network)
        const hash = tx.hash().toString('hex'),
            newItem = {
                id: hash,
                hash,
                operations: tx.operations,
                created_at: new Date().toISOString(),
                source_account: tx.source,
                successful: null,
                inProgress: true
            }
        this.records.unshift(newItem)
        return newItem
    }

    addNewTx(tx) {
        retrieveOperations(tx, this.network)
        this.removeInProgressTx([tx])
        const newHistory = [tx, ...this.records]
        while (newHistory.length > this.maxRecentEntries) {
            newHistory.pop()
        }
        this.records.replace(newHistory)
    }

    /**
     * Remove pending in-progress transactions that match executed/failed transaction received from Horizon
     * @param {Array<TransactionResponse>} newTransactions
     */
    removeInProgressTx(newTransactions) {
        for (let tx of newTransactions) {
            const idx = this.records.findIndex(t => t.id === tx.id)
            if (idx >= 0) {
                this.records.splice(idx, 1)
            }
        }
    }
}

/**
 *
 * @param {'public'|'testnet'} network
 * @param {String} address
 * @param {Boolean} includeFailed
 * @param {Function} onNewTx
 * @param {String} [cursor]
 * @return {Function}
 */
export function streamAccountTransactions({network, address, onNewTx, includeFailed = true, cursor}) {
    return createHorizon({network})
        .transactions()
        .forAccount(address)
        .includeFailed(!!includeFailed)
        .limit(200)
        .order('asc')
        .cursor(cursor || 'now')
        .stream({
            onmessage: tx => onNewTx(retrieveOperations(tx, network)),
            reconnectTimeout: 60000
        })
}

/**
 *
 * @param {'public'|'testnet'} network
 * @param {String} address
 * @param {Boolean} includeFailed
 * @param {Number} maxRecentEntries
 * @param {String} cursor
 * @return {Promise<Array<TransactionRecord>>}
 */
export function loadAccountTransactions({network, address, includeFailed = true, maxRecentEntries = 15, cursor}) {
    return createHorizon({network})
        .transactions()
        .forAccount(address)
        .limit(maxRecentEntries)
        .order('desc')
        .cursor(cursor)
        .includeFailed(true)
        .call()
        .then(data => data.records.map(tx => retrieveOperations(tx, network)))
}