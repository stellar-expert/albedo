import React from 'react'
import {Keypair} from 'stellar-sdk'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import {createHorizon} from '../../../util/horizon-connector'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import AccountActivityView from '../../account/account-activity-view'
import authorization from '../../../state/auth/authorization'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import './wallet.scss'

export default function WalletOperationsWrapperView({title, action, disabled, prepareTransaction, onConfirm, onFinalize, children}) {
    const network = useStellarNetwork()

    async function confirm() {
        try {
            const tx = await prepareTransaction()
            if (!tx) return
            await confirmTransaction(network, tx, onFinalize)
            onConfirm()
        } catch (e) {
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

async function confirmTransaction(network, transaction, onFinalize) {
    //obtain user credentials
    const credentials = await authorization.requestAuthorization(accountManager.activeAccount)

    //TODO: extract signing logic from wallet actions and intent action logic into a shared module
    if (credentials.account.isStoredAccount) { //stored account
        transaction.sign(await Keypair.fromSecret(credentials.requestAccountSecret()))
    } else if (credentials.account.isHWAccount) { //hardware wallet
        try {
            await this.hwSigner.signTransaction({
                path: credentials.account.path,
                publicKey: credentials.account.publicKey,
                transaction
            })
        } catch (e) {
            switch (e.name) {
                case 'TransportStatusError':
                default:
                    actionContext.runtimeErrors = 'Failed to connect. Please check hardware wallet connection.'
                    break
            }
            return
        }
    }
    //add a pending transaction record to the account tx history
    const inProgressTx = accountLedgerData.history.addInProgressTx(transaction)
    //submit to the network
    createHorizon(network)
        .submitTransaction(transaction)
        .then(() => {
            accountLedgerData.loadAccountInfo()
            onFinalize && onFinalize(network, transaction, accountLedgerData)
        })
        .catch(e => {
            console.error(e)
            accountLedgerData.history.addNewTx({...inProgressTx, inProgress: false, successful: false})
        })
}