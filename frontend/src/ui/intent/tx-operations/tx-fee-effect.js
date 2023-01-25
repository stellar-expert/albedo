import React from 'react'
import {Amount} from '@stellar-expert/ui-framework'

export default function TxFeeEffect({feeEffect, compact}) {
    const {charged, feeBid, feeBump} = feeEffect
    const fee = feeBid || charged
    return <div>
        <Amount amount={fee} asset="XLM" issuer={!compact}/> transaction {!!feeBump && 'bump'} fee charged
    </div>
}