import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {formatPrice} from '@stellar-expert/formatter'

export default function ConfirmBalanceActionView({transfer, value}) {
    const selfTransfer = transfer.source === transfer.destination
    const estimatedText = `(~${formatPrice(value)}$)`

    if (selfTransfer)
        return <div className="double-space">
            Swap {transfer.amount[0]}&thinsp;{getAssetCode(transfer.asset[0])} {estimatedText}&thinsp;→&thinsp;
            {transfer.amount[1]}&thinsp;{getAssetCode(transfer.asset[1])}?
        </div>
    return <div className="double-space">
        Transfer {transfer.amount[0]}&thinsp;{getAssetCode(transfer.asset[0])} {estimatedText}&thinsp;→&thinsp;
        <AccountAddress account={transfer.destination}/>?
        {(!!transfer.memo && transfer.memo !== 'none') && <div className="dimmed text-tiny nowrap">{`(memo: ${transfer.memo.value})`}</div>}
    </div>
}

function getAssetCode(asset) {
    return asset.split('-')[0]
}