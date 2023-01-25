export class ClaimableBalanceFilter {
    /**
     * @param {String} snapshot
     */
    constructor(snapshot = '') {
        this.filter = snapshot
    }

    /**
     * @type {String} - Hidden claimable balances
     * @private
     */
    filter

    get snapshot() {
        return this.filter
    }

    /**
     * Check if claimable balance is hidden by a user
     * @param {String} cbid
     * @return {Boolean}
     */
    isClaimableBalanceHidden(cbid) {
        if (!this.filter)
            return false
        return this.filter.includes(trim(cbid))
    }

    /**
     * Add claimable balance id to the bloom filter
     * @param {String} cbid
     */
    hideClaimableBalance(cbid) {
        if (!this.filter) {
            this.filter = ''
        }
        this.filter += trim(cbid)
    }
}

function trim(cbid) {
    return cbid.substring(0, 32)
}