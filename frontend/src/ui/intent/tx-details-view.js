import React from 'react'
import PropTypes from 'prop-types'
import {Transaction} from 'stellar-sdk'
import OperationDescription from './operation-description-view'
import AccountAddress from '../components/account-address'
import {zeroAccount} from '../../util/signature-hint-utils'

/**
 * Normalize transaction memo
 * @param {StellarBase.Memo} rawMemo - raw XDR memo
 * @returns {*}
 */
function TxFormattedMemo({rawMemo}) {
    switch (rawMemo && rawMemo._type) {
        case 'id':
        case 'text':
            return <><code className="word-break">{rawMemo._value}</code> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
        case 'hash':
        case 'return':
            return <><code className="word-break">{rawMemo._value.toString('base64')}</code> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
    }
    return <span className="dimmed">none</span>
}

function formatDateUTC(rawDate) {
    if (!rawDate) return 'undefined'
    return new Date(rawDate).toISOString().replace(/(T|\.\d+Z)/g, ' ') + 'UTC'
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
        tx = new Transaction(xdr, network)
    } catch (e) {
        console.error(e)
        tx = null
    }

    if (!tx) return <div>
        <span className="fa fa-exclamation-circle color-danger"/> Transaction is invalid and cannot be signed.
    </div>

    return <div className="tx-view space">
        <div>
            <span className="label">Source account: </span>
            {tx.source === zeroAccount ? 'unspecified' : <AccountAddress account={tx.source}/>}
        </div>
        <div>
            <span className="label">Source account sequence: </span>
            <code className="word-break">{tx.sequence == 0 ? 'unspecified' : tx.sequence}</code>
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

        <div className="space"><b>Operations:</b></div>
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

export default TxDetailsView