import React, {useCallback, useState} from 'react'
import cn from 'classnames'
import {ElapsedTime, AssetIcon, AssetIssuer, useStellarNetwork} from '@stellar-expert/ui-framework'
import {getClaimableBalanceClaimStatus} from '@stellar-expert/claimable-balance-utils'
import {AssetDescriptor, parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../../state/account-manager'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'
import {prepareClaimBalanceTx, validateClaimClaimableBalance} from './claim-balance-tx-builder'
import BalanceAmount from './balance-amount'
import './account-balance.scss'

const claimableBalanceStatusIcons = {
    available: 'icon-ok',
    pending: 'icon-clock',
    expired: 'icon-back-in-time'
}

export default function AccountClaimableBalanceView({balance, account}) {
    const asset = parseAssetFromObject(balance)
    const [claiming, setClaiming] = useState(false)
    const [hidden, setHidden] = useState(false)
    const network = useStellarNetwork()
    const claimant = balance.claimants.find(c => c.destination === account)
    const status = claimant ? getClaimableBalanceClaimStatus(claimant) : 'unavailable'

    async function claimBalance() {
        const validationResult = validateClaimClaimableBalance(balance)
        if (validationResult)
            return alert(validationResult)
        if (!accountLedgerData.hasTrustline(asset.toFQAN())) {
            await confirm(<div className="dimmed text-small">
                You need to establish a trustline to before claiming this payment.
                Would you like to create the trustline?
                This action will temporarily lock 0.5 XLM on your account balance.
            </div>)
        }
        setClaiming(true)
        try {
            const tx = await prepareClaimBalanceTx(balance, network)
            if (!tx)
                return
            await confirmTransaction(network, tx)
            navigation.navigate('/account')
        } catch (e) {
            console.error(e)
        }
        setClaiming(false)
    }

    const hideBalance = useCallback(() => {
        if (balance?.id) {
            const cbid = balance.id.substring(8)
            const {activeAccount} = accountManager
            activeAccount.hideClaimableBalance(cbid)
                .then(() => setHidden(true))
        }
    }, [balance?.id])

    if (hidden)
        return null

    return <div className="account-balance-container">
        <div className="account-balance claimable">
            <AssetIcon asset={asset}>
                <span className={cn('claimable-status', claimableBalanceStatusIcons[status] || 'icon-block')}/>
            </AssetIcon>
            <div className="text-left text-overflow">
                <div className="asset-code">
                    {asset.code}{' '}
                    {!!balance.last_modified_time && <span className="dimmed text-tiny">
                        (sent <ElapsedTime className="dimmed" ts={new Date(balance.last_modified_time)} suffix=" ago"/>)
                    </span>}
                </div>
                <AssetIssuer asset={asset}/>
            </div>
            <div className="text-right">
                {claiming ? <div style={{display: 'inline-block'}}>
                    <div className="loader" style={{margin: 0}}/>
                </div> : <>
                    <BalanceAmount amount={balance.amount}/>
                    {balance.estimated > 0 ?
                        <div className="estimated-amount dimmed text-tiny">
                            ~{balance.estimated}$
                        </div> :
                        <br/>}
                </>}
            </div>
        </div>
        <div className="account-balance-actions">
            {!claiming ? <>
                {status === 'available' ?
                    <a href="#" onClick={claimBalance}><i className="icon-angle-double-right"/>claim tokens</a> :
                    <span className="dimmed">{status}</span>
                }
                &emsp;<a href="#" onClick={hideBalance}><i className="icon-angle-double-right"/>decline</a>
            </> : <br/>}
        </div>
        <hr className="flare"/>
    </div>
}