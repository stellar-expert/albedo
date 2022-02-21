import React, {useEffect, useRef} from 'react'
import {observer} from 'mobx-react'
import {throttle} from 'throttle-debounce'
import cn from 'classnames'
import {ElapsedTime, TxLink, InlineProgress} from '@stellar-expert/ui-framework'
import OperationDescriptionView from '../intent/operation-description-view'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'

function shortenBinaryString(src) {
    if (src.length <= 18) return src
    return src.substr(0, 8) + '…' + src.substr(-8)
}

function getTxStatusIcon(tx) {
    if (!tx.successful) return <i className="icon-warning color-warning"/>
    return <i className="icon-ok color-success"/>
}

function getScrollParent(node) {
    if (node == null) return null
    if (node.scrollHeight > node.clientHeight) return node
    return getScrollParent(node.parentNode)
}

function AccountActivityView() {
    const {loaded, nonExisting, history, address} = accountLedgerData
    useEffect(() => {
        const container = document.scrollingElement
        const handler = throttle(200, false, function (e) {
            const scrolledToBottom = Math.ceil(container.scrollHeight - container.scrollTop - 70) < container.clientHeight
            if (scrolledToBottom) {
                accountLedgerData.history.loadNextPage()
            }
        })
        document.addEventListener('scroll', handler)
        return () => document.removeEventListener('scroll', handler)
    }, [address, loaded, history])

    if (!loaded || !nonExisting && !history.records.length) return <div className="loader"/>

    accountLedgerData.notificationCounters?.resetOperationsCounter()

    return <ul style={{minHeight: '20vmin'}} className="text-small">
        {history.records.map(tx => <li key={tx.hash}>
            <div className="dual-layout">
                {tx.inProgress ? <div className="dimmed">
                    <i className="icon-clock"/> Transaction in progress<InlineProgress/>
                </div> : <div>
                    <span className="dimmed">{getTxStatusIcon(tx)} Transaction</span>&nbsp;
                    <TxLink tx={tx.hash}><span title={tx.hash}>{shortenBinaryString(tx.hash)}</span></TxLink>
                    {tx.operations.length > 1 && <span className="dimmed text-tiny"> ({tx.operations.length} operations)</span>}
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
        {history.loading && <li className="dimmed text-tiny text-center">
            <div className="loader"/>
            loading history...
        </li>}
    </ul>
}

function opBelongsToAccount(address, op, tx) {
    if (tx.source_account === address) return true
    if (op.source === address || op.destination === address || op.trustor === address || op.account === address || op.from === address) return true
    if (op.claimants?.some(c => c.destination === address)) return true
    return false
}

export default observer(AccountActivityView)