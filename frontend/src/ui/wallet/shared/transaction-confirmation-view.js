import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import DialogView from '../../layout/dialog-view'
import {ConfirmIntentionView} from './confirm-intention-view'
import {confirmTransaction} from './wallet-tx-confirmation'
import ActionLoaderView from './action-loader-view'

/**
 * @param {String} action
 * @param {Bool} disabled
 * @param {Object} transfer
 * @param {Function} prepareTransaction
 * @param {Function} onFinalize
 * @constructor
 */
export default observer(function TransactionConfirmationView({action, disabled, transfer, prepareTransaction, onFinalize}) {
    const network = useStellarNetwork()
    const [inProgress, setInProgress] = useState(false)
    const [showConfirmIntention, setShowConfirmIntention] = useState(false)

    const showIntention = useCallback(() => {
        setShowConfirmIntention(true)
    }, [])

    const hideIntention = useCallback(() => {
        setShowConfirmIntention(false)
    }, [])

    const confirm = useCallback(async () => {
        try {
            setInProgress(true)
            const tx = await prepareTransaction()
            if (!tx)
                return
            await confirmTransaction(network, tx)
            notify({type: 'success', message: 'Transaction processed'})
            onFinalize()
        } catch (e) {
            setInProgress(false)
            if (e.status === 400) {
                notify({type: 'error', message: e.data.title})
                return
            }
            if (e.code === -4)
                return
            console.error('Failed to prepare transaction', e)
            notify({type: 'error', message: 'Transaction failed'})
        }
        setInProgress(false)
    }, [network, prepareTransaction, onFinalize])

    const confirmIntention = useCallback(() => {
        setShowConfirmIntention(false)
        confirm()
    }, [confirm])

    return (<>
        {prepareTransaction && <div className="row space">
            <div className="column column-50">
                <Button block disabled={disabled || inProgress} onClick={showIntention}>{action}</Button>
            </div>
            <div className="column column-50">
                <Button href="/" block outline>Cancel</Button>
            </div>
        </div>}
        {inProgress && <ActionLoaderView message="processing transaction"/>}
        <DialogView dialogOpen={showConfirmIntention}>
            <h2>Confirm transaction</h2>
            <ConfirmIntentionView transfer={transfer}/>
            <div className="row actions double-space">
                <div className="column column-50">
                    <Button block onClick={confirmIntention}>Confirm</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={hideIntention}>Cancel</Button>
                </div>
            </div>
        </DialogView>
    </>
    )
})