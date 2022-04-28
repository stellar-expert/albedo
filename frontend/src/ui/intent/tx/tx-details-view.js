import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {TransactionBuilder} from 'stellar-sdk'
import {observer} from 'mobx-react'
import {AccountAddress, CopyToClipboard, Spoiler} from '@stellar-expert/ui-framework'
import OperationDescription from '../operation-description-view'
import accountManager from '../../../state/account-manager'
import TxSourceAccountView from './tx-source-account-view'
import TxFormattedMemo, {hasMemo} from './tx-formatted-memo-view'
import TxTimeBoundsView, {hasTimeBounds} from './tx-timebounds-view'
import {shortenString} from '@stellar-expert/formatter'
import actionContext from '../../../state/action-context'

function TxDetailsView({xdr, network}) {
    const [extended, setExtended] = useState(false)
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
    const {selectedAccount} = actionContext,
        isFeeBump = !!tx.innerTransaction,
        feeSponsor = isFeeBump && tx.feeSource,
        txHash = tx.hash().toString('hex')
    if (isFeeBump) {
        tx = tx.innerTransaction
    }
    return <div className="space">
        {tx.operations.length === 1 ?
            <OperationDescription op={tx.operations[0]} source={tx.source}/> :
            <ul className="block-indent list">
                {tx.operations.map((op, i) => <li key={i}>
                    <OperationDescription key={i} op={op} source={tx.source}/>
                </li>)}
            </ul>}
        {extended && <>
            <div>
                <span className="label">Source account: </span>
                <TxSourceAccountView tx={tx} selectedAccount={selectedAccount}/>
            </div>
            {hasTimeBounds(tx) && <div>
                <span className="label">Time restrictions: </span>
                <TxTimeBoundsView tx={tx}/>
            </div>}
            {hasMemo(tx) && <div>
                <span className="label">Memo: </span><TxFormattedMemo rawMemo={tx.memo}/>
            </div>}
            {isFeeBump && <div>
                <span className="label">Fee sponsor: </span>
                <AccountAddress account={feeSponsor}/>
            </div>}
            <div>
                <span className="label">Source account sequence: </span>
                <span className="word-break">{tx.sequence === '0' ? (selectedAccount ? 'auto' : 'unspecified') : tx.sequence}</span>
            </div>
            <div>
                <span className="label">Transaction hash: </span>
                {shortenString(txHash, 20)}<CopyToClipboard text={txHash}/>
            </div>
        </>}
        <div style={{padding: '0.2em'}}/>
        <Spoiler className="text-small" expanded={extended} onChange={e => setExtended(e.expanded)}
                 showMore="Show extended transaction info"
                 showLess="Hide extended transaction info"/>
    </div>
}

TxDetailsView.propTypes = {
    xdr: PropTypes.string.isRequired,
    network: PropTypes.string.isRequired
}

export default observer(TxDetailsView)