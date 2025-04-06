import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import {confirmTransaction} from './wallet-tx-confirmation'
import {confirmSpending} from './spending-confirmation-view'
import ActionLoaderView from './action-loader-view'
import {runInAction} from 'mobx'

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

    const confirmTx = useCallback(async () => {
        runInAction(() => {
            transfer.inProgress = true
        })
        try {
            const tx = await prepareTransaction()
            if (!tx)
                return
            await confirmTransaction(network, tx)
            //'direct'|'convert'|'claimable'
            notify({type: 'success', message: action + ' processed successfully'})
            onFinalize()
        } catch (e) {
            handleError(e, transfer)
        }
        runInAction(() => {
            transfer.inProgress = false
        })
    }, [network, transfer, prepareTransaction, onFinalize])

    const proceed = useCallback(() => {
        if (!transfer.asset || skipConfirmation)
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
                <Button block disabled={disabled || transfer.inProgress} loading={transfer.inProgress} onClick={proceed}>{action}</Button>
            </div>
            <div className="column column-50">
                <Button href="/" block outline disabled={transfer.inProgress}>Cancel</Button>
            </div>
        </div>}
    </>
})

function handleError(e, transfer) {
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