import React, {useEffect, useState} from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {formatPrice} from '@stellar-expert/formatter'
import {fetchAssetPrices} from '../../../state/ledger-data/asset-price'

export function ConfirmIntentionView({transfer}) {
    const selfTransfer = transfer.source === transfer.destination
    const [estimatedText, setEstimatedText] = useState('')

    useEffect(() => {
        fetchAssetPrices(transfer.network, [transfer.asset[0]])
            .then(prices => {
                const estimatedValue = Object.values(prices)[0]
                const estimatedPrice = transfer.amount[0] * estimatedValue
                if (estimatedPrice) {
                    setEstimatedText(`(~${formatPrice(estimatedPrice)}$)`)
                }
            }).catch(e => console.error(e))
    }, [transfer])

    if (selfTransfer)
        return <div className="double-space">
            You are about to swap {transfer.amount[0]} {transfer.asset[0].split('-')[0]} {estimatedText} for&nbsp;
            {transfer.amount[1]} {transfer.asset[1].split('-')[0]}
        </div>
    return <div className="double-space">
        Transfer {transfer.amount[0]} {transfer.asset[0].split('-')[0]} {estimatedText} from&nbsp;
        <AccountAddress account={transfer.source}/> to&nbsp;
        <span className='nowrap inline-block'><AccountAddress account={transfer.destination}/>&nbsp;</span>
        {(!!transfer.memo && transfer.memo !== 'none') && <span className='nowrap'>{`(memo: ${transfer.memo.value})`}</span>}
    </div>
}