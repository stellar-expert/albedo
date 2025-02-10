import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import {confirmTransaction} from './wallet-tx-confirmation'
import {confirmSpending} from './spending-confirmation-view'
import ActionLoaderView from './action-loader-view'

/**
 * @param {String} action
 * @param {Boolean} disabled
 * @param {Object} transfer
 * @param {Function} prepareTransaction
 * @param {Function} onFinalize
 * @param {Boolean} [skipConfirmation]
 * @constructor
 */
export default observer(function TransactionConfirmationView({
                                                                 action,
                                                                 disabled,
                                                                 transfer,
                                                                 prepareTransaction,
                                                                 onFinalize,
                                                                 skipConfirmation = false
                                                             }) {
    const network = useStellarNetwork()
    const [inProgress, setInProgress] = useState(false)

    const confirmTx = useCallback(async () => {
        try {
            setInProgress(true)
            const tx = await prepareTransaction()
            if (!tx)
                return
            await confirmTransaction(network, tx)
            //'direct'|'convert'|'claimable'
            notify({type: 'success', message: 'Transaction processed successfully'})
            onFinalize()
        } catch (e) {
            setInProgress(false)
            if (e.status === 400) {
                notify({type: 'error', message: e.data.title})
                return
            }
            if (e.code === -4)
                return
            console.error('Failed to execute transaction', e)
            notify({
                type: 'error',
                message: `Transaction failed. Try to adjust transaction fee ${(transfer.destination || transfer?.mode === 'convert') ? 'or slippage tolerance ' : ''} and resubmit the transaction.`
            })
        }
        setInProgress(false)
    }, [network, prepareTransaction, onFinalize])

    const proceed = useCallback(() => {
        if (!transfer.asset)
            return confirmTx()
        const params = {
            kind: action.toLowerCase(),
            asset: transfer.asset[0],
            amount: transfer.amount[0]
        }
        if (transfer.destination) {
            params.memo = transfer.memo
            params.destination = transfer.destination
        }
        confirmSpending(params)
            .then(confirmTx)
    }, [confirmTx])

    return <>
        {prepareTransaction && <div className="row space">
            <div className="column column-50">
                <Button block disabled={disabled || inProgress} onClick={proceed}>{action}</Button>
            </div>
            <div className="column column-50">
                <Button href="/" block outline>Cancel</Button>
            </div>
        </div>}
        {inProgress && <ActionLoaderView message="processing transaction"/>}
    </>
})