import {action, observable, runInAction, makeObservable} from 'mobx'
import {createHorizon} from '../../util/horizon-connector'
import {parseTxDetails} from '../../ui/intent/tx-operations/tx-details-parser'

export default class AccountTransactionHistory {
    constructor(network, address) {
        this.address = address
        this.network = network
        this.records = []
        makeObservable(this, {
            records: observable,
            loading: observable,
            hasMore: observable,
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
     * @readonly
     */
    address = ''
    /**
     * Stellar network identifier
     * @type {'public'|'testnet'}
     * @readonly
     */
    network = 'public'
    /**
     * Transactions history for current account
     * @type {Array<ParsedTxDetails>}
     * @readonly
     */
    records = []
    /**
     * Loaded records paging token
     * @type {String}
     * @private
     */
    cursor
    /**
     * Recent entries to load
     * @type {Number}
     * @private
     */
    maxRecentEntries = 20
    /**
     * In the process of loading
     * @type {Boolean}
     * @readonly
     */
    loading = false
    /**
     * Has more records to load
     * @type {Boolean}
     * @readonly
     */
    hasMore = undefined
    /**
     * Finalize stream handler
     * @private
     */
    finalizeStream = null

    /**
     * Load transactions history
     * @return {Promise}
     */
    async loadNextPage() {
        if (this.loading || this.hasMore === false)
            return
        let recordsToLoad = this.maxRecentEntries
        try {
            this.loading = true
            while (recordsToLoad > 0) {
                //fetch account transactions
                const count = Math.min(recordsToLoad * 3, 100)
                let newBatch = await loadAccountTransactions({
                    network: this.network,
                    address: this.address,
                    cursor: this.cursor,
                    count
                })
                //if no records returned
                if (!newBatch.length) {
                    runInAction(() => {
                        this.hasMore = false
                    })
                    break
                }

                let hasMore = newBatch.length === count
                //process records
                const loadedRecords = []
                for (let tx of newBatch) {
                    this.cursor = tx.paging_token
                    //retrieve only relevant transactions
                    if (tx.unmatched)
                        continue
                    loadedRecords.push(tx)
                    if (loadedRecords.length >= recordsToLoad) {
                        hasMore = true
                        break //stop if enough records loaded
                    }
                }


                if (!loadedRecords.length && hasMore)
                    continue
                //update records
                runInAction(() => {
                    if (loadedRecords.length) {
                        this.removeInProgressTx(loadedRecords)
                        this.records.replace([...this.records, ...loadedRecords])
                    }
                    if (!hasMore)
                        this.hasMore = false
                })
                //remaining records number
                recordsToLoad -= newBatch.length
            }
        } catch (e) {
            if (e.name !== 'NotFoundError') {
                console.error(e)
            } else {
                this.hasMore = false
            }
        }
        runInAction(() => {
            this.loading = false
        })
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
        return this.addNewTx({envelope_xdr: tx.toXDR('base64')}, true)
    }

    addNewTx(tx, inProgress = false) {
        const parsedTxDetails = tx.txHash ?
            tx :
            processTransactionRecord(this.network, this.address, tx, inProgress)
        this.removeInProgressTx([tx])
        this.records.unshift(parsedTxDetails)
        if (!inProgress) {
            while (this.records.length > this.maxRecentEntries) {
                this.records.pop()
            }
        }
        this.hasMore = undefined
        return parsedTxDetails
    }

    /**
     * Remove pending in-progress transactions that match executed/failed transaction received from Horizon
     * @param {ParsedTxDetails[]} newTransactions
     */
    removeInProgressTx(newTransactions) {
        for (let tx of newTransactions) {
            const idx = this.records.findIndex(existing => existing.txHash === tx.txHash)
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
 * @internal
 */
function streamAccountTransactions({network, address, onNewTx, includeFailed = true, cursor}) {
    return createHorizon({network})
        .transactions()
        .forAccount(address)
        .includeFailed(!!includeFailed)
        .limit(200)
        .order('asc')
        .cursor(cursor || 'now')
        .stream({
            onmessage: tx => {
                const processed = processTransactionRecord(network, address, tx)
                if (!processed.unmatched) {
                    onNewTx(processed)
                }
            },
            reconnectTimeout: 60000
        })
}

/**
 *
 * @param {'public'|'testnet'} network
 * @param {String} address
 * @param {Boolean} includeFailed
 * @param {Number} count
 * @param {String} cursor
 * @return {Promise<ParsedTxDetails[]>}
 * @internal
 */
function loadAccountTransactions({network, address, includeFailed = true, count = 20, cursor}) {
    return createHorizon({network})
        .transactions()
        .forAccount(address)
        .limit(count)
        .order('desc')
        .cursor(cursor)
        .includeFailed(true)
        .call()
        .then(data => data.records.map(tx => processTransactionRecord(network, address, tx)))
}

/**
 * @param {String} network
 * @param {String} address
 * @param {TransactionRecord} txRecord
 * @param {Boolean} inProgress
 * @returns {ParsedTxDetails}
 * @internal
 */
function processTransactionRecord(network, address, txRecord, inProgress = false) {
    const details = parseTxDetails({
        network,
        txEnvelope: txRecord.envelope_xdr,
        result: txRecord.result_xdr,
        meta: txRecord.result_meta_xdr,
        context: address,
        skipUnrelated: true,
        createdAt: inProgress ? new Date().toISOString() : txRecord.created_at
    })
    if (txRecord.paging_token) {
        details.paging_token = txRecord.paging_token
    }
    return details
}