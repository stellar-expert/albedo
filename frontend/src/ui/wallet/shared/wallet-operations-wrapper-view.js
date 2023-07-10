import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import DialogView from '../../layout/dialog-view'
import {confirmTransaction} from './wallet-tx-confirmation'
import {ConfirmIntentionView} from './confirm-intention-view'
import ActionLoaderView from './action-loader-view'
import './wallet.scss'

/**
 * @param {String} title
 * @param {String} action?
 * @param {Bool} disabled?
 * @param {Object} transfer?
 * @param {Function} prepareTransaction
 * @param {Function} onFinalize
 * @param {Boolean} allowNonExisting?
 * @param {*} children
 * @constructor
 */
function WalletOperationsWrapperView({title, action, disabled, transfer, prepareTransaction, onFinalize, allowNonExisting, children}) {
    const [inProgress, setInProgress] = useState(false)
    const renderChildren = !accountLedgerData.nonExisting || allowNonExisting
    const network = useStellarNetwork()
    const [fundingInProgress, setFundingInProgress] = useState(false)
    const [showConfirmIntention, setShowConfirmIntention] = useState(false)

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(accountLedgerData.address)
            .then(() => new Promise(r => setTimeout(r, 6000)))
            .then(() => accountLedgerData.loadAccountInfo())
            .finally(() => setFundingInProgress(false))
    }

    function confirmIntention() {
        setShowConfirmIntention(false)
        confirm()
    }

    async function confirm() {
        try {
            setInProgress(true)
            const tx = await prepareTransaction()
            if (!tx)
                return
            await confirmTransaction(network, tx)
            notify('success', 'Transaction processed')
            onFinalize()
        } catch (e) {
            setInProgress(false)
            if (e.status === 400) {
                notify('error', e.data.title)
                return
            }
            if (e.code === -4)
                return
            console.error('Failed to prepare transaction', e)
            notify('error', 'Transaction failed')
        }
        setInProgress(false)
    }

    return <div className="wallet-operations space">
        {!!title && <h3 className="space">{title}</h3>}
        {accountLedgerData.loaded ?
            <>
                {accountLedgerData.nonExisting && !fundingInProgress && !allowNonExisting && <>
                    <div className="text-tiny segment space text-center">
                        Account doesn't exist on the ledger.
                        <br/>
                        You need to <a href="/wallet/receive">fund it</a> with XLM in order to send/receive assets.
                        {network === 'testnet' && <div>
                            <a href="#" onClick={createTestnetAccount}>Fund test account automatically?</a>
                        </div>}
                    </div>
                    <div className="space"/>
                </>}
                {!!fundingInProgress && <ActionLoaderView message="creating account"/>}
                {renderChildren && <>{children}</>}
                {renderChildren && !!prepareTransaction && <div className="row space">
                    <div className="column column-50">
                        <Button block disabled={disabled || inProgress} onClick={() => setShowConfirmIntention(true)}>{action}</Button>
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
                            <Button block outline onClick={() => setShowConfirmIntention(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogView>
            </> :
            <ActionLoaderView message="loading account info"/>}
    </div>
}

export default observer(WalletOperationsWrapperView)