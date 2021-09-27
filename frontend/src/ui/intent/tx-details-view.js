import React from 'react'
import PropTypes from 'prop-types'
import {TransactionBuilder} from 'stellar-sdk'
import {observer} from 'mobx-react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import OperationDescription from './operation-description-view'
import {zeroAccount} from '../../util/tx-replace-utils'
import accountManager from '../../state/account-manager'

/**
 * Normalize transaction memo
 * @param {StellarBase.Memo} rawMemo - raw XDR memo
 * @returns {*}
 */
function TxFormattedMemo({rawMemo}) {
    switch (rawMemo && rawMemo._type) {
        case 'id':
        case 'text':
            return <><code className="word-break">{rawMemo._value.toString()}</code> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
        case 'hash':
        case 'return':
            return <><code className="word-break">{rawMemo._value.toString('base64')}</code> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
    }
    return <span className="dimmed">none</span>
}

function formatDateUTC(rawDate) {
    rawDate = parseInt(rawDate || 0)
    if (!rawDate) return 'unrestricted'
    return new Date(rawDate * 1000).toISOString().replace(/(T|\.\d+Z)/g, ' ') + 'UTC'
}

function normalizeAsset(asset) {
    if (!asset) return null
    return parseAsset({
        asset_code: asset.code,
        asset_issuer: asset.issuer
    })
}

function TxDetailsView({xdr, network}) {
    let tx
    try {
        tx = TransactionBuilder.fromXDR(xdr, network)
    } catch (e) {
        console.error(e)
        tx = null
    }

    if (!tx) return <div>
        <span className="icon-warning color-danger"/> Transaction is invalid and cannot be signed.
    </div>
    const {activeAccount} = accountManager,
        isFeeBump = !!tx.innerTransaction,
        feeSponsor = isFeeBump && tx.feeSource
    if (isFeeBump) {
        tx = tx.innerTransaction
    }
    return <div className="space">
        {isFeeBump && <div>
            <span className="label">Fee sponsor: </span>
            <AccountAddress account={feeSponsor}/>
        </div>}
        <div>
            <span className="label">Source account: </span>
            {tx.source === zeroAccount ?
                (activeAccount ?
                        activeAccount.displayName :
                        <code>unspecified</code>
                ) :
                <AccountAddress account={tx.source}/>}
        </div>
        <div>
            <span className="label">Source account sequence: </span>
            <code className="word-break">{tx.sequence === '0' ?
                (activeAccount ? 'auto' : 'unspecified')
                : tx.sequence}</code>
        </div>
        <div>
            <span className="label">Memo: </span><TxFormattedMemo rawMemo={tx.memo}/>
        </div>
        {tx.timeBounds && (tx.timeBounds.minTime > 0 || tx.timeBounds.maxTime > 0) && <div>
            <span className="label">Valid during: </span>
            <code>{formatDateUTC(tx.timeBounds.minTime)} - {formatDateUTC(tx.timeBounds.maxTime)}</code>
        </div>}
        <div>
            <span className="label">Hash: </span><code className="word-break">{tx.hash().toString('hex')}</code>
        </div>
        <ol className="block-indent">
            {tx.operations.map((op, i) => <li key={i}>
                <OperationDescription key={i} op={op} source={tx.source}/>
            </li>)}
        </ol>
    </div>
}

TxDetailsView.propTypes = {
    xdr: PropTypes.string.isRequired,
    network: PropTypes.string.isRequired
}

export default observer(TxDetailsView)