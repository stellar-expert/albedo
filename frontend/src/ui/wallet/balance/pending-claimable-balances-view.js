import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import {createHorizon} from '../../../util/horizon-connector'
import AccountBalanceView from './account-balance-view'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

const balancesBatchSize = 200

function useAccountClaimableBalances(account) {
    const network = useStellarNetwork(),
        [balances, setBalances] = useState(null)

    useEffect(() => {
        let res = []

        function fetchBalances(cursor = undefined) {
            return createHorizon(network).claimableBalances()
                .claimant(account)
                .order('desc')
                .limit(balancesBatchSize)
                .call()
                .then(({records}) => {
                    if (records.length) {
                        res = res.concat(records)
                    }
                    if (records.length === balancesBatchSize && res.length < 1000) {
                        setTimeout(() => fetchBalances(records[records.length - 1].paging_token), 100)
                        return
                    }
                    setBalances(res)
                })
                .catch(e => {
                    console.error(e)
                    setBalances([])
                })
        }

        fetchBalances()
    }, [account])

    return balances
}

function PendingClaimableBalancesView() {
    const {publicKey} = accountManager.activeAccount,
        balances = useAccountClaimableBalances(publicKey)

    accountLedgerData.notificationCounters?.resetClaimableBalanceCounter()

    return <div className="space">
        {balances ? <>
                {balances.map(balance => <AccountBalanceView balance={balance} account={publicKey} key={balance.id}/>)}
                {!balances.length && <div className="text-center text-small dimmed">No pending balances so far</div>}
            </> :
            <div className="loader"/>}
    </div>
}

export default observer(PendingClaimableBalancesView)