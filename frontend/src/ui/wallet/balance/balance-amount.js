import React from 'react'
import {formatWithPrecision} from '@stellar-expert/formatter'

export default function BalanceAmount({amount}) {
    const [integer, fractional = ''] = formatWithPrecision(amount).split('.')
    return <div className="asset-amount">
        {integer}<span className="dimmed text-small condensed">.{fractional.padEnd(7, '0')}</span>
    </div>
}