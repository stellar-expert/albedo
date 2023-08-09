import React, {useCallback, useEffect} from 'react'
import {observer} from 'mobx-react'
import {useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../shared/slippage-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TransferSettings from '../transfer/transfer-settings'
import TransferValidationView from '../transfer/transfer-validation-view'
import TransactionConfirmationView from '../shared/transaction-confirmation-view'
import FeeView from '../shared/fee-view'
import SwapBandView from './swap-band-view'

function SwapView() {
    const network = useStellarNetwork()
    const [swap] = useDependantState(() => new TransferSettings(network, 'convert', true), [network])
    const {address, balancesWithPriority} = accountLedgerData

    useEffect(() => {
        swap.startLedgerStreaming()
        return swap.stopLedgerStreaming
    }, [swap, network, address])

    const updateSlippage = useCallback(v => swap.setSlippage(v), [swap])

    const prepareTransaction = useCallback(() => swap.prepareTransaction(), [swap])

    const resetOperationAmount = useCallback(() => swap.resetOperationAmount(), [swap])

    return <WalletOperationsWrapperView title="Trade">
        <WalletPageActionDescription>exchange your tokens</WalletPageActionDescription>
        <div className="swap segment micro-space">
            <div className="params">
                <TransferAmountView settings={swap} index={0} balances={balancesWithPriority} restricted/>
                <SwapBandView settings={swap} balances={balancesWithPriority}/>
                <TransferAmountView settings={swap} index={1} balances={balancesWithPriority}/>
            </div>
            <SwapSlippageView title="Max slippage" defaultValue={1} onChange={updateSlippage}/>
            <FeeView transfer={swap}/>
            <TransferValidationView transfer={swap}/>
        </div>
        <TransactionConfirmationView action="Swap" disabled={!swap.isValid || !swap.conversionFeasible} transfer={swap}
                                     prepareTransaction={prepareTransaction} onFinalize={resetOperationAmount}/>
    </WalletOperationsWrapperView>
}

export default observer(SwapView)