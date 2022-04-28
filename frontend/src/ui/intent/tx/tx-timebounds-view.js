import React from 'react'
import {formatDateUTC} from '@stellar-expert/formatter'

export function hasTimeBounds(tx) {
    return tx.timeBounds && (tx.timeBounds.minTime > 0 || tx.timeBounds.maxTime > 0)
}

export default function TxTimeBoundsView({tx}) {
    const {minTime, maxTime} = tx.timeBounds
    if (minTime > 0 && maxTime > 0) return <span>{formatDateUTC(minTime)} - {formatDateUTC(maxTime)}</span>
    if (minTime > 0) return <span>from {formatDateUTC(minTime)}</span>
    if (maxTime > 0) return <span>to {formatDateUTC(maxTime)}</span>
}