import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {formatWithAutoPrecision} from '@stellar-expert/formatter'
import {createHorizon} from '../../../util/horizon-connector'
import {fetchAssetPrices} from '../../../state/ledger-data/asset-price'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import accountManager from '../../../state/account-manager'
import AccountClaimableBalanceView from './account-claimable-balance-view'

const balancesBatchSize = 200

async function fetchBalances(account, network, onUpdate, cursor = undefined) {
    const {activeAccount} = accountManager
    let res = []
    let query = createHorizon(network).claimableBalances()
        .claimant(account)
        .order('desc')
        .limit(balancesBatchSize)
    if (cursor) {
        query = query.cursor(cursor)
    }
    try {
        const {records} = await query.call()
        if (records.length) {
            res = res.concat(records.filter(r => !activeAccount.cbFilter.isClaimableBalanceHidden(r.id.substring(8))))
        }
        if (records.length === balancesBatchSize && res.length < 1000) {
            const lastRecord = records[records.length - 1].paging_token
            setTimeout(() => fetchBalances(account, network, onUpdate, lastRecord), 200)
            return
        }
        //update prices
        await updateEstimatedPrices(network, res)
        onUpdate(res)
    } catch (e) {
        console.error(e)
        onUpdate([])
    }
}

async function updateEstimatedPrices(network, claimableBalances) {
    const assets = {}
    //map unique assets to claimable balances
    for (let cb of claimableBalances) {
        const asset = AssetDescriptor.parse(cb.asset).toFQAN()
        let relatedBalances = assets[asset]
        if (!relatedBalances) {
            relatedBalances = assets[asset] = []
        }
        relatedBalances.push(cb)
    }
    let uniqueAssets = Object.keys(assets)
    //retrieve prices from the server
    while (uniqueAssets.length > 0) {
        //take 100 records for the batch
        const batch = uniqueAssets.slice(0, 100)
        uniqueAssets = uniqueAssets.slice(100)
        //retrieve asset prices
        const prices = await fetchAssetPrices(network, batch)
        for (const [key, price] of Object.entries(prices)) {
            const cbs = assets[key]
            if (!cbs?.length)
                continue
            //set estimated value for every related claimable balance
            for (let cb of cbs) {
                cb.estimated = formatWithAutoPrecision(cb.amount * price)
            }
        }
    }
}

function useAccountClaimableBalances(account) {
    const network = useStellarNetwork()
    const [balances, setBalances] = useState(null)

    useEffect(() => {
        setBalances(null)
        if (!account) return
        fetchBalances(account, network, setBalances)
    }, [account, network])

    return balances
}

function PendingClaimableBalancesView() {
    const {address} = accountLedgerData
    const balances = useAccountClaimableBalances(address)

    setTimeout(() => accountLedgerData.notificationCounters?.resetClaimableBalanceCounter(), 200)

    return <div className="space">
        {balances ? <>
                {balances.map(balance => <AccountClaimableBalanceView balance={balance} account={address} key={balance.id}/>)}
                {!balances.length && <div className="text-center text-small dimmed space">(no pending balances so far)</div>}
            </> :
            <div className="loader"/>}
    </div>
}

export default observer(PendingClaimableBalancesView)