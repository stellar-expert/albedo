const accounts = {}

const fakeHorizon = {
    addAccount(id, account) {
        accounts[id] = account
        return account
    },
    removeAccount(account) {
        delete accounts[account.id]
    },
    lookup(id) {
        return accounts[id]
    },
    loadAccount: (publicKey) => {
        const account = accounts[publicKey]
        account.balances = []
        account.account_id = account._accountId
        if (account) return Promise.resolve(account)
        return Promise.reject({response: {status: 404, statusText: 'Not found', data: {status: 404}}})
    },
    feeStats: () => ({
      "last_ledger": "22606298",
      "last_ledger_base_fee": "100",
      "ledger_capacity_usage": "0.97",
      "min_accepted_fee": "100",
      "mode_accepted_fee": "250",
      "p10_accepted_fee": "100",
      "p20_accepted_fee": "100",
      "p30_accepted_fee": "250",
      "p40_accepted_fee": "250",
      "p50_accepted_fee": "250",
      "p60_accepted_fee": "1210",
      "p70_accepted_fee": "1221",
      "p80_accepted_fee": "1225",
      "p90_accepted_fee": "1225",
      "p95_accepted_fee": "1225",
      "p99_accepted_fee": "8000"
    })
}

export { fakeHorizon }
