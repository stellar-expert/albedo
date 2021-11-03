import React, {useRef} from 'react'
import {observer} from 'mobx-react'
import {throttle} from 'throttle-debounce'
import cn from 'classnames'
import {ElapsedTime, TxLink, InlineProgress} from '@stellar-expert/ui-framework'
import OperationDescriptionView from '../intent/operation-description-view'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'
import {xdrParseClaimant} from '../../util/claim-condtions-xdr-parser'

function shortenBinaryString(src) {
    if (src.length <= 18) return src
    return src.substr(0, 8) + '…' + src.substr(-8)
}

function getTxStatusIcon(tx) {
    if (!tx.successful) return <i className="icon-warning color-warning"/>
    return <i className="icon-ok color-success"/>
}

function AccountActivityView() {
    const container = useRef(null)

    function handleInteraction() {
        const parent = container.current,
            scrolledToBottom = Math.ceil(parent.scrollHeight - parent.scrollTop - 8) < parent.clientHeight
        if (scrolledToBottom) {
            accountLedgerData.history.loadNextPage()
        }
    }

    const {loaded, nonExisting, history, address} = accountLedgerData

    if (!loaded || !nonExisting && !history.records.length) return <div className="loader"/>
    return <ul style={{minHeight: '20vmin', overflowY: 'auto', overflowX: 'hidden'}} className="text-small"
               ref={container} onScroll={throttle(200, () => handleInteraction())}>
        {history.records.map(tx => <li key={tx.hash}>
            <div className="dual-layout">
                {tx.inProgress ? <div className="dimmed">
                    <i className="icon-clock"/> Transaction in progress<InlineProgress/>
                </div> : <div>
                    <span className="dimmed">{getTxStatusIcon(tx)} Transaction</span>&nbsp;
                    <TxLink tx={tx.hash}><span title={tx.hash}>{shortenBinaryString(tx.hash)}</span></TxLink>
                    {tx.successful === false && <span className="dimmed"> - failed</span>}
                </div>}
                <div>
                    <ElapsedTime className="dimmed" ts={new Date(tx.created_at)} suffix=" ago"/>
                </div>
            </div>
            {tx.operations.length > 0 && <ul className="block-indent">
                {tx.operations.filter(op => opBelongsToAccount(address, op, tx))
                    .map(op => <li key={op.id} className="appear">
                        <OperationDescriptionView op={op} source={tx.source_account}/>
                    </li>)}
            </ul>}
        </li>)}
        {!history.records.length && <div className="dimmed text-tiny text-center">
            (No transactions so far)
        </div>}
    </ul>
}

function opBelongsToAccount(address, op, tx) {
    if (tx.source_account === address) return true
    if (op.source === address || op.destination === address || op.trustor === address || op.account === address || op.from === address) return true
    if (op.claimants?.some(c => c.destination === address)) return true
    return false
}

export default observer(AccountActivityView)