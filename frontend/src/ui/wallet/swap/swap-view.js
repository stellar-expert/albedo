import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {AssetLink, InfoTooltip, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import ToggleSwitch from '../../components/toggle-switch'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../shared/slippage-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import SwapValidationView from './swap-validation-view'
import TransactionConfirmationView from '../shared/transaction-confirmation-view'
import FeeView from '../shared/fee-view'
import SwapBandView from './swap-band-view'
import SwapSettings from './swap-settings'
import SmartSwapConfirmationView from './stellar-broker-confirmation-view'

function SwapView() {
    const network = useStellarNetwork()
    const [swap, setSwap] = useState(new SwapSettings())
    useEffect(() => {
        const swap = new SwapSettings(network)
        setSwap(swap)
        return () => {
            swap.dispose()
        }
    }, [network, accountLedgerData.address])
    const {balancesWithPriority} = accountLedgerData
    const updateSlippage = useCallback(v => swap.setSlippage(v), [swap])
    const prepareTransaction = useCallback(() => swap.prepareTransaction(), [swap])
    const resetOperationAmount = useCallback(() => swap.resetOperationAmount(), [swap])
    const changeProvider = useCallback(use => swap.setUseStellarBroker(use), [swap])
    if (!swap.network)
        return null
    return <WalletOperationsWrapperView title="Trade">
        <WalletPageActionDescription>exchange your tokens</WalletPageActionDescription>
        <div className="swap segment micro-space">
            <div className="params">
                <TransferAmountView settings={swap} index={0} balances={balancesWithPriority} restricted/>
                <SwapBandView settings={swap} balances={balancesWithPriority}/>
                <TransferAmountView settings={swap} index={1} balances={balancesWithPriority} profit={swap.profit} readOnly/>
            </div>
            <div className="dual-layout space">
                <div>
                    {network === 'public' && <>
                        <label className="text-tiny">
                            <ToggleSwitch checked={swap.useStellarBroker} onChange={changeProvider}/>Smart routing
                            <InfoTooltip onClick={stopPropagation}>
                                Advanced routing splits the swap into multiple transactions in order to get better exchange
                                rates by reaching all available liquidity on Soroban protocols and Stellar Classic DEX.
                            </InfoTooltip>
                        </label>
                    </>}
                </div>
                <div style={{minWidth: '60%'}}>
                    <div className="row">
                        <div className="column column-50 mobile-right">
                            <SwapSlippageView title="Slippage tolerance" value={swap.conversionSlippage} onChange={updateSlippage}/>
                            <div className="micro-space mobile-only"/>
                        </div>
                        <div className="column column-50 text-right">
                            <FeeView transfer={swap}/>
                        </div>
                    </div>
                </div>
            </div>
            <SwapValidationView swap={swap}/>
        </div>
        {swap.useStellarBroker ?
            <SmartSwapConfirmationView swap={swap} disabled={!swap.isValid || !swap.conversionFeasible}/> :
            <TransactionConfirmationView action="Swap" disabled={!swap.isValid} transfer={swap} prepareTransaction={prepareTransaction} onFinalize={resetOperationAmount}/>
        }
    </WalletOperationsWrapperView>
}

function stopPropagation(e) {
    e.preventDefault()
}

export default observer(SwapView)