import React from 'react'
import {action, observable, runInAction, makeObservable} from 'mobx'
import {parseTxDetails} from '@stellar-expert/ui-framework'
import {createHorizon} from '../../util/horizon-connector'

export default class AccountTransactionHistory {
    constructor(network, address, history) {
        this.address = address
        this.network = network
        this.records = []
        this.history = history
        makeObservable(this, {
            records: observable.shallow,
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
     * @type {PaginatedListViewModel}
     * @readonly
     */
    history
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
        runInAction(() => {
            this.loading = true
        })

        //fetch account transactions
        const {data, loaded, canLoadNextPage} = await this.history.load(1)
        if (!loaded)
            return
        let records = data.map(tx => processTransactionRecord(this.network, this.address, tx))

        //update records
        runInAction(() => {
            if (records.length) {
                this.removeInProgressTx(data)
                this.records.replace([...this.records, ...data])
            }
            if (!canLoadNextPage.length) {
                this.hasMore = false
            }
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
        txEnvelope: txRecord.envelope_xdr || txRecord.body,
        result: txRecord.result_xdr || txRecord.result,
        meta: txRecord.result_meta_xdr || txRecord.meta,
        context: {account: [address]},
        skipUnrelated: true,
        createdAt: inProgress ? new Date().toISOString() : (txRecord.created_at || new Date(txRecord.ts * 1000).toISOString())
    })
    if (txRecord.paging_token) {
        details.paging_token = txRecord.paging_token
    }
    return details
}