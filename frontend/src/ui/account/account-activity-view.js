import React, {useRef, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {throttle} from 'throttle-debounce'
import ElapsedTime from '../components/elapsed-time'
import ExplorerLink from '../components/explorer-link'
import OperationDescriptionView from '../intent/operation-description-view'
import AccountLedgerData from '../../state/account-ledger-data'

function shortenBinaryString(src) {
    if (src.length <= 18) return src
    return src.substr(0, 8) + '…' + src.substr(-8)
}

function AccountActivityView({ledgerData}) {
    const [enableStreaming, setStreamingEnabled] = useState(true),
        container = useRef(null)

    function handleInteraction() {
        const parent = container.current,
            streamAllowed = parent.scrollTop === 0,
            scrolledToBottom = Math.ceil(parent.scrollHeight - parent.scrollTop - 8) < parent.clientHeight
        if (enableStreaming !== streamAllowed) {
            setStreamingEnabled(streamAllowed)
            if (streamAllowed) {
                ledgerData.startHistoryStreaming()
            } else {
                ledgerData.stopHistoryStreaming()
            }
        }
        if (scrolledToBottom) {
            ledgerData.loadHistoryNextPage()
        }
    }

    useEffect(() => {
        ledgerData.startHistoryStreaming()
        return () => ledgerData.stopHistoryStreaming()
    }, [ledgerData.address, ledgerData.network])

    return <div>
        <h3>Activity</h3>
        {ledgerData.txHistory === null ?
            <div className="loader"/> :
            <ul style={{maxHeight: '40vh', minHeight: '20vmin', overflowY: 'auto', overflowX: 'hidden'}}
                ref={container} onScroll={throttle(200, () => handleInteraction())}>
                {ledgerData.txHistory.map(tx => <li className="tx" key={tx.hash}>
                    <div>
                        <span className="dimmed">Transaction</span>&nbsp;
                        <ExplorerLink type="tx" path={tx.hash}>
                            <span title={tx.hash}>{shortenBinaryString(tx.hash)}</span>
                        </ExplorerLink>
                        {!tx.successful &&
                        <span className="dimmed"> <i className="fa fa-w icon-warning warning"/> failed</span>}
                        {' '}<ElapsedTime className="dimmed" ts={new Date(tx.created_at)} suffix=" ago"/>

                    </div>
                    {tx.operations.length > 0 && <ul className="block-indent">
                        {tx.operations.map(op => <li key={op.id} className="appear">
                            <OperationDescriptionView op={op} source={tx.source_account}/>{' '}
                            <ExplorerLink type="op" path={op.id}><i className="fa fa-external-link"/></ExplorerLink>
                        </li>)}
                    </ul>}
                </li>)}
                {!ledgerData.txHistory.length && <div className="dimmed text-micro text-center">
                    (No transactions so far)
                </div>}
            </ul>}
    </div>
}

AccountActivityView.propTypes = {
    ledgerData: PropTypes.instanceOf(AccountLedgerData).isRequired
}

export default observer(AccountActivityView)