import React, {useEffect, useState} from 'react'
import {shortenString} from "@stellar-expert/formatter"
import {fetchAssetPrices} from "../../../state/ledger-data/asset-price"

export function ConfirmIntentionView({transfer}) {
    const selfTransfer = transfer.source === transfer.destination
    const [estimatedText, setEstimatedText] = useState('')

    useEffect(() => {
        (async () => {
            try {
                const prices = await fetchAssetPrices(transfer.network, [transfer.asset[0]])
                const estimatedValue = Object.values(prices)[0]
                const estimatedPrice = transfer.amount[0] * estimatedValue
                if (estimatedPrice) setEstimatedText(`(~${estimatedPrice.toFixed(2)}$)`)
            } catch (e) {
                console.log(e)
            }
        })()
    }, [transfer])

    if (selfTransfer)
        return <div className="double-space">
            You are about to swap {transfer.amount[0]} {transfer.asset[0].split('-')[0]} {estimatedText} to&nbsp;
            {transfer.amount[1]} {transfer.asset[1].split('-')[0]}
        </div>
    return <div className="double-space">
        You are about to transfer {transfer.amount[0]} {transfer.asset[0].split('-')[0]} {estimatedText} to the account <span className='nowrap'>
            {shortenString(transfer.destination, 8)}
        </span> {(!!transfer.memo && transfer.memo !== 'none') && <span className='nowrap'>{`(memo: ${transfer.memo.value})`}</span>}
    </div>
}