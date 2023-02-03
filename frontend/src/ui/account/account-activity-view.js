import React, {useEffect, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {throttle} from 'throttle-debounce'
import {ElapsedTime, TxLink} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'
import AccountTransactionHistory from '../../state/ledger-data/account-transactions-history'
import TxOperationsList from '../intent/tx-operations/tx-operations-list'
import ActionLoaderView from '../wallet/shared/action-loader-view'

function getScrollParent(node) {
    if (node == null) return null
    if (node.scrollHeight > node.clientHeight) return node
    return getScrollParent(node.parentNode)
}

function AccountActivityView() {
    const [compact, setCompact] = useState(true)
    const [history, setHistory] = useState(null)
    const txHistoryRef = useRef()
    const {nonExisting, address, network} = accountLedgerData
    useEffect(() => {
        let newHistory = accountLedgerData.history
        if (!newHistory) {
            newHistory = accountLedgerData.history = new AccountTransactionHistory(network, address)
            if (!nonExisting) {
                newHistory.loadNextPage()
            }
        }
        newHistory.startStreaming()
        setHistory(newHistory)
        const container = document.scrollingElement
        const handler = throttle(200, function () {
            //const container = txHistoryRef.current
            const scrolledToBottom = Math.ceil(container.scrollHeight - container.scrollTop - 70) < container.clientHeight
            if (scrolledToBottom) {
                newHistory.loadNextPage()
            }
        }, {noLeading: true})
        document.addEventListener('scroll', handler)
        return () => {
            newHistory.stopStreaming()
            document.removeEventListener('scroll', handler)
        }
    }, [address, network, nonExisting])

    if (!nonExisting && (!history || history.loading && !history.records.length))
        return <ActionLoaderView message="loading history"/>

    setTimeout(() => accountLedgerData.notificationCounters?.resetOperationsCounter(), 200)

    if (!history?.records.length) {
        return <div className="dimmed text-small text-center space">
            (no transactions so far)
        </div>
    }

    return <div>
        <div className="text-right">
            <label className="dimmed text-small">
                <input type="checkbox" checked={!compact} onChange={e => setCompact(!e.target.checked)}/>{' '}
                Extended transactions information
            </label>
        </div>
        <ul style={{minHeight: '20vmin'}} className="text-small" ref={txHistoryRef}>
            {history.records.map(tx => <li key={tx.txHash}>
                <div className="text-tiny text-right">
                    {tx.isEphemeral && <span className="dimmed">
                        <i className="icon-clock"/> transaction in progress…
                    </span>}
                    {!tx.successful && <span className="dimmed">
                        <i className="icon-warning-hexagon color-warning"/> transaction failed
                    </span>}
                    {' '}
                    <TxLink tx={tx.txHash}>
                        <ElapsedTime ts={new Date(tx.createdAt)} suffix=" ago"/>
                    </TxLink>
                </div>
                <TxOperationsList parsedTx={tx} compact={compact}/>
                <hr className="flare"/>
            </li>)}
            {history.loading && <li key="loader" className="dimmed text-tiny text-center">
                <ActionLoaderView message="loading history"/>
            </li>}
            {history.hasMore === false && <div className="text-center dimmed micro-space">
                - no more records -
                <div className="micro-space"/>
            </div>}
        </ul>
    </div>
}

export default observer(AccountActivityView)