import React, {useState} from 'react'
import {TransactionBuilder} from 'stellar-sdk'
import {observer} from 'mobx-react'
import {AccountAddress, CopyToClipboard, Spoiler} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import OperationDescription from '../operation-description-view'
import TxSourceAccountView from './tx-source-account-view'
import TxFormattedMemo, {hasMemo} from './tx-formatted-memo-view'
import TxTimeBoundsView, {hasTimeBounds} from './tx-timebounds-view'

/**
 * Transaction details
 * @param {String} xdr - Transaction XDR
 * @param {String} network - Network identifier or passphrase
 * @param {Account} account - Account used to sign the transaction
 * @param {Boolean} compact? - Whether to show extended tx info
 */
function TxDetailsView({xdr, network, account, compact = false}) {
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
    const isFeeBump = !!tx.innerTransaction
    const feeSponsor = isFeeBump && tx.feeSource
    const txHash = tx.hash().toString('hex')
    const sourceAccountDiffers = tx.source !== account?.publicKey
    if (isFeeBump) {
        tx = tx.innerTransaction
    }
    return <div>
        {tx.operations.length === 1 ?
            <OperationDescription op={tx.operations[0]} source={tx.source}/> :
            <>{tx.operations.map((op, i) => <div key={i}>
                <i className="icon icon-angle-right"/><OperationDescription key={i} op={op} source={tx.source}/>
            </div>)}</>}
        {sourceAccountDiffers && <div>
            <span className="label">Source account: </span>
            <TxSourceAccountView tx={tx} selectedAccount={account}/>
        </div>}
        {!compact && <>
            {extended && <>
                {!sourceAccountDiffers && <div>
                    <span className="label">Source account: </span>
                    <TxSourceAccountView tx={tx} selectedAccount={account}/>
                </div>}
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
                    <span className="word-break">{tx.sequence === '0' ? (account ? 'auto' : 'unspecified') : tx.sequence}</span>
                </div>
                <div>
                    <span className="label">Transaction hash: </span>
                    {shortenString(txHash, 20)}<CopyToClipboard text={txHash}/>
                </div>
            </>}
            <div style={{padding: '0.2em'}}/>
            <Spoiler className="text-small" expanded={extended} onChange={e => setExtended(e.expanded)}
                     showMore="Show extended transaction info" showLess="Hide extended transaction info"/>
        </>}
    </div>
}

export default observer(TxDetailsView)