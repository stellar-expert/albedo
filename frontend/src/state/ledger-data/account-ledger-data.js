import {useEffect, useState} from 'react'
import {observable, makeObservable, action, computed, runInAction} from 'mobx'
import {calculateAvailableBalance, useStellarNetwork} from '@stellar-expert/ui-framework'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import AccountTransactionHistory from './account-transactions-history'
import AccountNotificationCounter from '../account-notification-counter'
import {createHorizon} from '../../util/horizon-connector'

const defaultThresholds = {low: 1, med: 1, high: 1}
Object.freeze(defaultThresholds)

/**
 * On-chain account balances and activity.
 */
class AccountLedgerData {
    constructor() {
        makeObservable(this, {
            address: observable,
            network: observable,
            history: observable,
            accountData: observable.ref,
            balances: observable.ref,
            pendingLiabilities: observable.ref,
            notificationCounters: observable,
            init: action,
            reset: action,
            error: observable,
            loaded: observable,
            nonExisting: observable,
            balancesWithPriority: computed
        })
        this.pendingLiabilities = {}
        this.balances = {}
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
     * Account data obtained from Horizon
     * @type {AccountResponse}
     */
    accountData

    /**
     * Current account balances
     * @type {{}}
     */
    balances

    /**
     * Liabilities in pending transactions
     * @type {{}}
     */
    pendingLiabilities

    /**
     * @type {AccountNotificationCounter}
     */
    notificationCounters

    error

    nonExisting = false

    loaded = false

    /**
     * @type {AccountTransactionHistory}
     */
    history

    /**
     * Account sequence
     * @type {String}
     */
    get sequence() {
        return this.accountData?.sequenceNumber()
    }

    init(address, network) {
        this.address = address
        this.network = network
        this.history = new AccountTransactionHistory(network, address)
        this.notificationCounters = new AccountNotificationCounter(network, address)
        this.reset()
        this.loadAccountInfo()
        this.history.startStreaming()
    }

    reset() {
        this.balances = {}
        this.nonExisting = false
        this.error = undefined
        this.loaded = false
    }

    /**
     * Load general account info from the ledger
     */
    loadAccountInfo() {
        fetchAccountHorizonData(this.network, this.address)
            .then(accountData => runInAction(() => {
                if (accountData.error) {
                    this.reset()
                    this.error = accountData.error
                    this.nonExisting = accountData.nonExisting
                } else {
                    this.accountData = accountData
                    this.balances = accountData.balancesMap
                    this.pendingLiabilities = {} //reset after each account info update
                    this.nonExisting = false
                    this.error = null
                }
                this.loaded = true
            }))
    }

    /**
     * Get asset amount available for trade/transfer with respect to liabilities and reserves
     * @param {String} asset - Asset identifier
     * @param {Number|String} [additionalReserves] - Additional reserves required for the wallet operation
     * @return {string}
     */
    getAvailableBalance(asset, additionalReserves = 0) {
        const trustline = this.balances[asset]
        if (!trustline) return '0'
        return calculateAvailableBalance(this.accountData, trustline, additionalReserves)
    }

    get balancesWithPriority() {
        const res = [...Object.values(this.balances)]
        res.sort((a, b) => {
            if (a.asset_type === 'native') return -1
            if (a.balance == 0 && b.balance > 0) return 1
            if (b.balance == 0 && a.balance > 0) return -1
            if (a.asset_code === b.asset_code) return a.balance - b.balance
            return (a.asset_code > b.asset_code) ? 1 : (a.asset_code < b.asset_code) ? -1 : 0
        })
        return res
    }

    hasTrustline(asset) {
        return this.balances[asset] !== undefined
    }

    /**
     * Stop pulling data from Horizon and free all resources
     */
    finalize() {
        this.history?.stopStreaming()
    }
}

const accountLedgerData = new AccountLedgerData()

export default accountLedgerData

function fetchAccountHorizonData(network, address) {
    return createHorizon({network}).loadAccount(address)
        .then(accountData => {
            const balances = {}
            for (let balance of accountData.balances) {
                const id = parseAssetFromObject(balance).toFQAN()
                balance.id = id
                balances[id] = balance
            }
            accountData.balancesMap = balances
            return accountData
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
            return {error, nonExisting}
        })
}

export function useDestinationAccountLedgerData(address) {
    const network = useStellarNetwork(),
        [data, setData] = useState(null)
    useEffect(() => {
        if (address) {
            fetchAccountHorizonData(network, address)
                .then(setData)
        }
        return () => setData(null)
    }, [address])
    return data
}