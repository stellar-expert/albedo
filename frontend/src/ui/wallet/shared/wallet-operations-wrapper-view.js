import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import {addNotify} from '../../../ui/notifications/add-notify'
import {confirmTransaction} from './wallet-tx-confirmation'
import ActionLoaderView from './action-loader-view'
import './wallet.scss'

/**
 * @param {String} title
 * @param {String} action?
 * @param {Bool} disabled?
 * @param {Function} prepareTransaction
 * @param {Function} onFinalize
 * @param {Boolean} allowNonExisting?
 * @param {*} children
 * @constructor
 */
function WalletOperationsWrapperView({title, action, disabled, prepareTransaction, onFinalize, allowNonExisting, children}) {
    const [inProgress, setInProgress] = useState(false)
    const renderChildren = !accountLedgerData.nonExisting || allowNonExisting
    const network = useStellarNetwork()
    const [fundingInProgress, setFundingInProgress] = useState(false)

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(accountLedgerData.address)
            .then(() => new Promise(r => setTimeout(r, 6000)))
            .then(() => accountLedgerData.loadAccountInfo())
            .finally(() => setFundingInProgress(false))
    }

    async function confirm() {
        try {
            setInProgress(true)
            const tx = await prepareTransaction()
            if (!tx)
                return
            await confirmTransaction(network, tx)
            addNotify('success', 'Transaction is successful')
            onFinalize()
        } catch (e) {
            setInProgress(false)
            if (e.status === 400) {
                addNotify('error', e.data.title)
                return 
            }
            if (e.code === -4)
                return
            console.error('Failed to prepare transaction', e)
            addNotify('error', 'Transaction execution failed')
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
                        <Button block disabled={disabled || inProgress} onClick={confirm}>{action}</Button>
                    </div>
                    <div className="column column-50">
                        <Button href="/" block outline>Cancel</Button>
                    </div>
                </div>}
                {inProgress && <ActionLoaderView message="processing transaction"/>}
            </> :
            <ActionLoaderView message="loading account info"/>}
    </div>
}

export default observer(WalletOperationsWrapperView)