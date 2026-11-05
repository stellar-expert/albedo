const accounts = new Map()

const feeStats = {
    last_ledger: '22606298',
    last_ledger_base_fee: '100',
    ledger_capacity_usage: '0.97',
    fee_charged: {max: '8000', min: '100', mode: '250', p10: '100', p20: '100', p30: '250', p40: '250', p50: '250', p60: '1210', p70: '1221', p80: '1225', p90: '1225', p95: '1225', p99: '8000'},
    max_fee: {max: '10000', min: '100', mode: '250', p10: '100', p20: '100', p30: '250', p40: '250', p50: '1000', p60: '1500', p70: '2000', p80: '2500', p90: '3000', p95: '5000', p99: '10000'}
}

const fakeHorizon = {
    /**
     * Register an existing account
     * @param {String} address - Account address
     * @param {String} [sequence] - Account sequence
     */
    addAccount(address, sequence = '1') {
        accounts.set(address, sequence)
    },
    removeAccount(address) {
        accounts.delete(address)
    },
    reset() {
        accounts.clear()
    }
}

function accountRecord(address) {
    return {
        id: address,
        account_id: address,
        sequence: accounts.get(address),
        subentry_count: 0,
        last_modified_ledger: 1,
        thresholds: {low_threshold: 0, med_threshold: 0, high_threshold: 0},
        flags: {auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false},
        balances: [{asset_type: 'native', balance: '100.0000000'}],
        signers: [{key: address, weight: 1, type: 'ed25519_public_key'}],
        data: {},
        num_sponsoring: 0,
        num_sponsored: 0,
        paging_token: address,
        _links: {}
    }
}

function jsonResponse(body, status = 200) {
    return {status, body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}
}

/**
 * Route Horizon and StellarExpert API requests made via fetch to the fake responses.
 */
function setupFakeHorizon() {
    fetch.mockResponse(async req => {
        const {pathname} = new URL(req.url)
        if (pathname === '/explorer/directory/blocked-domains')
            return jsonResponse({_embedded: {records: []}})
        if (pathname === '/fee_stats')
            return jsonResponse(feeStats)
        const [, address] = /^\/accounts\/(\w+)$/.exec(pathname) || []
        if (address && accounts.has(address))
            return jsonResponse(accountRecord(address))
        return jsonResponse({type: 'https://stellar.org/horizon-errors/not_found', title: 'Resource Missing', status: 404}, 404)
    })
}

export {fakeHorizon, setupFakeHorizon}
