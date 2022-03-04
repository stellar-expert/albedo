import React, {useEffect, useState} from 'react'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {createHorizon} from '../../../util/horizon-connector'
import AccountBalanceView from './account-balance-view'

const balancesBatchSize = 200

function useAccountClaimableBalances(account) {
    const network = useStellarNetwork(),
        [balances, setBalances] = useState(null)

    useEffect(() => {
        let res = []
        setBalances(null)
        function fetchBalances(cursor = undefined) {
            let query = createHorizon(network).claimableBalances()
                .claimant(account)
                .order('desc')
                .limit(balancesBatchSize)
            if (cursor) {
                query = query.cursor(cursor)
            }
            return query.call()
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

function PendingClaimableBalancesView({ledgerData, account}) {
    const balances = useAccountClaimableBalances(account)

    ledgerData.notificationCounters?.resetClaimableBalanceCounter()

    return <div className="space">
        {balances ? <>
                {balances.map(balance => <AccountBalanceView balance={balance} account={account} key={balance.id}/>)}
                {!balances.length && <div className="text-center text-small dimmed">No pending balances so far</div>}
            </> :
            <div className="loader"/>}
    </div>
}

export default PendingClaimableBalancesView