import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../shared/slippage-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TransferSettings from '../transfer/transfer-settings'
import TransferValidationView from '../transfer/transfer-validation-view'
import SwapBandView from './swap-band-view'
import FeeView from '../shared/fee-view'
import {estimateFee} from '../../../util/fee-estimator'

function SwapView() {
    const network = useStellarNetwork()
    const [swap] = useDependantState(() => new TransferSettings(network, 'convert', true), [network])
    const {address, balancesWithPriority} = accountLedgerData
    const [showFee, setShowFree] = useState(false)
    const [actualFee, setActualFee] = useState(100)

    useEffect(() => estimateFee(network).then(estimatedFee => setActualFee(estimatedFee)), [network])

    useEffect(() => {
        swap.startLedgerStreaming()
        return swap.stopLedgerStreaming
    }, [network, address])

    const updateSlippage = v => swap.setSlippage(v)

    return <WalletOperationsWrapperView title="Trade" action="Swap" disabled={!swap.isValid || !swap.conversionFeasible}
                                        prepareTransaction={() => swap.prepareTransaction(actualFee)}
                                        onFinalize={() => swap.resetOperationAmount()}>
        <WalletPageActionDescription>exchange your tokens</WalletPageActionDescription>
        <div className="swap segment micro-space">
            <div className="params">
                <TransferAmountView settings={swap} index={0} balances={balancesWithPriority} restricted/>
                <SwapBandView settings={swap} balances={balancesWithPriority}/>
                <TransferAmountView settings={swap} index={1} balances={balancesWithPriority}/>
            </div>
            <SwapSlippageView title="Slippage tolerance" defaultValue={1} onChange={updateSlippage}/>
            {(!showFee) ? <div className="space"><a className="text-small dimmed" onClick={() => setShowFree(true)}>Adjust transaction fee</a></div> :
                <FeeView defaultValue={actualFee * 0.0000001} onChange={v => setActualFee((v / 0.0000001).toFixed(0))}/>
            }
            <TransferValidationView transfer={swap}/>
        </div>
    </WalletOperationsWrapperView>
}

export default observer(SwapView)