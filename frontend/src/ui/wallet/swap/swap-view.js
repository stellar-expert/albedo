import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {InfoTooltip, useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../shared/slippage-view'
import TransferSettings from '../transfer/transfer-settings'
import SwapBandView from './swap-band-view'
import TransferValidationView from '../transfer/transfer-validation-view'

function SwapView() {
    const network = useStellarNetwork(),
        [valid, setValid] = useState(false),
        [swap] = useDependantState(() => new TransferSettings(network, 'convert'), [network]),
        balances = accountLedgerData.balancesWithPriority

    useEffect(() => {
        swap.setDestination(accountLedgerData.address)
        swap.startLedgerStreaming()
        return swap.stopLedgerStreaming
    }, [network, accountLedgerData.address])

    const updateSlippage = v => swap.setSlippage(v)

    return <WalletOperationsWrapperView title="Swap tokens" action="Swap" disabled={!valid || !swap.conversionFeasible}
                                        prepareTransaction={() => swap.prepareTransaction()}
                                        onFinalize={() => swap.resetOperationAmount()}>
        <div className="swap space">
            <div className="params">
                <TransferAmountView settings={swap} index={0} balances={balances} restricted/>
                <SwapBandView settings={swap}/>
                <TransferAmountView settings={swap} index={1} balances={balances}/>
            </div>
            <SwapSlippageView title="Slippage tolerance" defaultValue={1} onChange={updateSlippage}/>
            <TransferValidationView transfer={swap} destination={accountLedgerData} onValidate={setValid}/>
        </div>
    </WalletOperationsWrapperView>
}

export default observer(SwapView)