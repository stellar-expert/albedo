import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

export function validateSwap(swap) {
    if (!swap.asset[1] || swap.asset[0] === swap.asset[1] || (!parseFloat(swap.amount[0]) && !parseFloat(swap.amount[1])))
        return 'missing_parameters'

    if (accountLedgerData.nonExisting)
        return 'missing_account'

    /*if (!swap.hasSufficientBalance)
        return 'insufficient_balance'*/

    if (!accountLedgerData.balances[swap.asset[1]] && !swap.createTrustline)
        return 'trustline_missing'
}