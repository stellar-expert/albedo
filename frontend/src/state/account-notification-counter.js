import {makeAutoObservable, runInAction} from 'mobx'
import {getNewClaimableBalancesSince, getNewPaymentsSince} from '../util/account-notifications'
import {getCurrentLedger} from '../util/current-ledger-resolver'
import accountManager from './account-manager'

function resolveCounterLoader(type) {
    switch (type) {
        case 'op':
            return getNewPaymentsSince
        case 'cb':
            return getNewClaimableBalancesSince
    }
    throw new Error(`Invalid notifications counter identifier: ${type}`)
}

function getLastCheckedLedger(activeAccount, network, type) {
    try {
        return accountManager.get(activeAccount).seen[network][type] || 0
    } catch (e) {
        return 0
    }
}

export default class AccountNotificationCounter {
    constructor(network, address) {
        this.network = network
        this.address = address
        makeAutoObservable(this)
        this.initCounters()
    }

    network

    address

    counters = {}

    get claimableBalanceCounter() {
        return this.counters.cb || 0
    }

    get operationsCounter() {
        return this.counters.op || 0
    }

    initCounters() {
        return Promise.all(['cb', 'op'].map(type => {
            const from = getLastCheckedLedger(this.address, this.network, type)
            return resolveCounterLoader(type)(this.network, this.address, from)
                .then(cnt => runInAction(() => this.counters[type] = cnt))
        }))
            .then(() => setTimeout(() => console.log(this.counters), 5000))
    }

    resetCounter(type) {
        this.counters[type] = 0
        getCurrentLedger(this.network)
            .then(seq => accountManager.get(this.address).setCheckedMarker(this.network, type, seq))
            .catch(e => console.error(e))
    }

    resetClaimableBalanceCounter() {
        this.resetCounter('cb')
    }

    resetOperationsCounter() {
        this.resetCounter('op')
    }
}