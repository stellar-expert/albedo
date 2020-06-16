import React, {useRef, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {Transaction, Networks} from 'stellar-sdk'
import Bignumber from 'bignumber.js'
import {throttle} from 'throttle-debounce'
import {createHorizon} from '../../util/horizon-connector'
import ElapsedTime from '../components/elapsed-time'
import OperationDescriptionView from '../intent/operation-description-view'
import ExplorerLink from '../components/explorer-link'
import {useStellarNetwork} from '../../state/network-selector'

const maximum = 15

function shortenBinaryString(src) {
    if (src.length <= 18) return src
    return src.substr(0, 8) + '…' + src.substr(-8)
}

function retrieveOperations(tx, network) {
    const parsed = new Transaction(tx.envelope_xdr, Networks[network.toUpperCase()])
    tx.operations = parsed.operations.map((op, i) => {
        const opid = new Bignumber(tx.paging_token)
            .add(i + 1)
        op.id = opid.toString()
        return op
    })
    return tx
}

function AccountActivityView({address}) {
    const [transactions, setTransactions] = useState(null),
        [enableStreaming, setStreamingEnabled] = useState(true),
        network = useStellarNetwork(),
        container = useRef(null),
        loadingNextPage = useRef(null),
        finalizeStream = useRef(null)

    function loadNextPage(cursor) {
        if (loadingNextPage.current) return loadingNextPage.current
        if (cursor === undefined) {
            cursor = transactions ? transactions[transactions.length - 1].paging_token : null
        }
        loadingNextPage.current = createHorizon({network})
            .transactions()
            .forAccount(address)
            .limit(maximum)
            .order('desc')
            .cursor(cursor)
            .call()
            .then(data => {
                const newBatch = data.records.map(tx => retrieveOperations(tx, network))
                setTransactions(transactions => cursor === null ? newBatch : [...(transactions || []), ...newBatch])
                loadingNextPage.current = null
                return newBatch
            })
            .catch(e => {
                if (e.name === 'NotFoundError') {
                    setTransactions([])
                } else {
                    console.error(e)
                }
                loadingNextPage.current = null
            })
        return loadingNextPage.current
        //TODO: show loader progress while the next page is loading
    }

    function startStreaming() {
        if (finalizeStream.current) return
        return loadNextPage(null)
            .then(fetchedTransactions => {
                finalizeStream.current && finalizeStream.current()
                const cursor = (fetchedTransactions || [])[0]?.paging_token || null
                finalizeStream.current = createHorizon({network})
                    .transactions()
                    .forAccount(address)
                    .limit(maximum)
                    .order('asc')
                    .cursor(cursor)
                    .stream({
                        onmessage: tx => setTransactions(transactions => {
                            retrieveOperations(tx, network)
                            let res = [tx, ...(transactions || [])]
                            if (res.length > maximum) {
                                res = res.slice(0, maximum)
                            }
                            return res
                        }),
                        reconnectTimeout: 60000
                    })
            })
    }

    function stopStreaming() {
        //stop Horizon stream
        if (finalizeStream.current) {
            finalizeStream.current()
            finalizeStream.current = null
        }
    }

    function handleInteraction() {
        const parent = container.current,
            streamAllowed = parent.scrollTop === 0,
            scrolledToBottom = Math.ceil(parent.scrollHeight - parent.scrollTop) === parent.clientHeight
        if (enableStreaming !== streamAllowed) {
            setStreamingEnabled(streamAllowed)
            if (streamAllowed) {
                startStreaming()
            } else {
                stopStreaming()
            }
        }
        if (scrolledToBottom) {
            loadNextPage()
        }
    }

    useEffect(() => {
        stopStreaming()
        if (transactions && transactions.length) {
            setTransactions([])
        }
        startStreaming()

        return () => stopStreaming()
    }, [address])

    return <div>
        <h3>Activity</h3>
        {transactions === null ?
            <div className="loader"/> :
            <ul style={{maxHeight: '40vh', minHeight: '20vmin', overflowY: 'auto', overflowX: 'hidden'}}
                ref={container} onScroll={throttle(200, () => handleInteraction())}>
                {transactions.map(tx => <li className="tx" key={tx.hash}>
                    <div>
                        <span className="dimmed">Transaction</span>&nbsp;
                        <ExplorerLink type="tx" path={tx.hash}>
                            <span title={tx.hash}>{shortenBinaryString(tx.hash)}</span>
                        </ExplorerLink>
                        {!tx.successful &&
                        <span className="dimmed"> <i className="fa fa-w icon-warning warning"/> failed</span>}
                        {' '}<ElapsedTime className="dimmed" ts={new Date(tx.created_at)} suffix=" ago"/>

                    </div>
                    <ul className="block-indent">
                        {tx.operations.map(op => <li key={op.id} className="appear">
                            <OperationDescriptionView op={op} source={tx.source_account}/>{' '}
                            <ExplorerLink type="op" path={op.id}><i className="fa fa-external-link"/></ExplorerLink>
                        </li>)}
                    </ul>
                </li>)}
                {!transactions.length && <div className="dimmed text-micro text-center">
                    (No transactions so far)
                </div>}
            </ul>}
    </div>
}

export default AccountActivityView