import React, {useEffect, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {throttle} from 'throttle-debounce'
import {ElapsedTime, TxLink, TxOperationsList, Dropdown, useTxHistory} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../state/ledger-data/account-ledger-data'
import AccountTransactionHistory from '../../state/ledger-data/account-transactions-history'
import ActionLoaderView from '../wallet/shared/action-loader-view'

const displayOptions = [
    {value: 'compact', title: 'Compact history'},
    {value: 'extended', title: 'Extended information'}
]

function AccountActivityView() {
    const {nonExisting, address, network} = accountLedgerData
    const [display, setDisplay] = useState('compact')
    const [history, setHistory] = useState(null)
    const historyModel = useTxHistory({
        filters: {account: [address]},
        order: 'desc',
        rows: 50,
        updateLocation: false
    })
    const txHistoryRef = useRef()
    useEffect(() => {
        let newHistory = accountLedgerData.history
        if (!newHistory) {
            newHistory = accountLedgerData.history = new AccountTransactionHistory(network, address, historyModel)
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
        <div className="text-right text-small">
            <Dropdown options={displayOptions} value={display} onChange={setDisplay}/>
        </div>
        <ul style={{minHeight: '20vmin'}} className="text-small" ref={txHistoryRef}>
            {history.records.map(tx => <li key={tx.txHash}>
                <div className="text-tiny text-right">
                    {tx.isEphemeral && <span className="dimmed">
                        <i className="icon-clock"/> transaction in progress…
                    </span>}
                    {!tx.successful && <span className="dimmed">
                        <i className="icon-warning color-warning"/> transaction failed
                    </span>}
                    {' '}
                    <TxLink tx={tx.txHash}>
                        <ElapsedTime ts={new Date(tx.createdAt)} suffix=" ago"/>
                    </TxLink>
                </div>
                <TxOperationsList parsedTx={tx} compact={display === 'compact'} showFees={display !== 'compact'}/>
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