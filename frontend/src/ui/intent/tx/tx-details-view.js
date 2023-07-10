import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, CopyToClipboard, Spoiler, TxOperationsList, parseTxDetails} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
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
    let parsedTx
    try {
        parsedTx = parseTxDetails({
            network,
            txEnvelope: xdr
        })
    } catch (e) {
        return <div>
            <span className="icon-warning color-danger"/> Transaction is invalid and cannot be signed.
        </div>
    }
    const {tx, txHash} = parsedTx
    const isFeeBump = !!tx.innerTransaction
    const feeSponsor = isFeeBump && tx.feeSource
    const sourceAccountDiffers = tx.source !== account?.publicKey
    return <div>
        <TxOperationsList parsedTx={parsedTx}/>
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