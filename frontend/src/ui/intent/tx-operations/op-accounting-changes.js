import React from 'react'
import Bignumber from 'bignumber.js'
import {Amount} from '@stellar-expert/ui-framework'
import {denominate} from '../../../util/denominate'

const manageOfferOpTypes = ['manageSellOffer', 'manageBuyOffer', 'createPassiveSellOffer']

function retrieveAccountingChanges(op) {
    const {effects} = op.operation
    const changes = effects.filter(e => e.source === op.context && (e.type === 'accountDebited' || e.type === 'accountCredited'))
    if (changes.length) {
        changes.sort((a, b) => a.type - b.type)
        return changes
    }

    if (manageOfferOpTypes.includes(op.operation.type)) {
        const debitedAmounts = []
        const creditedAmounts = []
        let sourceAsset
        let destAsset

        for (let e of effects) {
            if (![e.seller, e.source].includes(op.context) || e.type !== 'trade')
                continue
            let {amount} = e
            sourceAsset = e.asset[1]
            destAsset = e.asset[0]
            if (e.seller === op.context) {
                amount = amount.slice().reverse()
                sourceAsset = e.asset[1]
                destAsset = e.asset[0]
            }
            debitedAmounts.push(amount[1])
            creditedAmounts.push(amount[0])
        }
        if (!debitedAmounts.length)
            return []

        return [
            {
                type: 'accountDebited',
                source: op.context,
                asset: sourceAsset,
                amount: sumAmounts(debitedAmounts)
            },
            {
                type: 'accountCredited',
                source: op.context,
                asset: destAsset,
                amount: sumAmounts(creditedAmounts)
            }
        ]
    }
    return []
}

function sumAmounts(amounts) {
    return amounts.reduce((prev, v) => prev.add(v), new Bignumber(0))
}

/**
 * Compact accounting effects (credited/debited amounts)
 * @param {OperationDescriptor} op
 * @constructor
 */
export function OpAccountingChanges({op}) {
    const changes = retrieveAccountingChanges(op)
    return <div className="accounting-effects condensed">
        {changes.map((ch, i) => <div key={op.txHash + op.order + i}
                                     className={ch.type === 'accountDebited' ? 'dimmed' : 'color-success'}>
            {ch.type === 'accountDebited' ? '-' : '+'}
            <Amount amount={ch.amount} asset={ch.asset} issuer={false} icon={false}/>
        </div>)}
    </div>
}

export function TxFeeAccountingChanges({amount}) {
    return <div className="accounting-effects condensed">
        <div className="dimmed">
            -<Amount amount={amount} asset="XLM" issuer={false} icon={false}/>
        </div>
    </div>
}