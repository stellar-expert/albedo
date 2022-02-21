import React from 'react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import AccountActivityView from '../../account/account-activity-view'
import {confirmTransaction} from './wallet-tx-confirmation'
import './wallet.scss'

export default function WalletOperationsWrapperView({title, action, disabled, prepareTransaction, onFinalize, children}) {
    const network = useStellarNetwork()

    async function confirm() {
        try {
            const tx = await prepareTransaction()
            if (!tx) return
            await confirmTransaction(network, tx)
            onFinalize()
        } catch (e) {
            if (e.code === -4) return
            console.error('Failed to prepare transaction', e)
            alert('Transaction execution failed')
        }
    }

    return <div className="wallet-operations space">
        {!!title && <h3>{title}</h3>}
        <hr className="flare"/>
        {children}
        <div className="space">
            <Button block disabled={disabled} onClick={confirm}>{action}</Button>
        </div>
        <hr title="Transactions history" className="flare"/>
        <AccountActivityView/>
    </div>
}

