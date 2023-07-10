import {createHorizon} from './horizon-connector'
import Bignumber from 'bignumber.js'

/**
 * Get the number of new claimable balance entries since the last check
 * @param {String} network - Current network
 * @param {String} account - Account public key
 * @param {Number} ledger - Ledger sequence to check from
 * @return {Promise<Number>}
 */
export function getNewClaimableBalancesSince(network, account, ledger) {
    return createHorizon(network).claimableBalances()
        .claimant(account)
        .order('asc')
        .limit(1)
        .cursor((1 + ledger) + '-000000000000000000000000000000000000000000000000000000000000000000000000')
        .call()
        .then(({records}) => records.length)
}

/**
 * Get the number of new incoming payments since the last check
 * @param {String} network - Current network
 * @param {String} account - Account public key
 * @param {Number} ledger - Ledger sequence to check from
 * @return {Promise<Number>}
 */
export function getNewPaymentsSince(network, account, ledger) {
    let payments = 0,
        iterations = 0

    function fetchPayments(cursor) {
        return createHorizon(network).payments()
            .forAccount(account)
            .order('asc')
            .limit(100)
            .cursor(cursor)
            .call()
            .then(({records}) => {
                payments += records.filter(r => r.source_account !== account).length
                if (payments >= 100 || iterations > 4 || records.length < 200)
                    return payments
                iterations++
                return fetchPayments(records[records.length - 1].paging_token)
            })
    }

    return fetchPayments(new Bignumber(ledger + 1).times(new Bignumber(4294967295)).toString())
}