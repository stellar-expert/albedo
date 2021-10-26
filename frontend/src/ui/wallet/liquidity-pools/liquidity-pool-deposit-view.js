import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {useDependantState} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {useStellarNetwork} from '../../../state/network-selector'
import LiquidityPoolDepositSettings from './liquidity-pool-deposit-settings'
import TransferAmountView from '../shared/transfer-amount-view'
import {useLiquidityPoolInfo} from './liquidity-pool-info'
import LiquidityPoolInfoView from './liquidity-pool-info-view'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import SlippageView from '../shared/slippage-view'
import AvailableAmountLink from '../shared/available-amount-link-ivew'
import './liquidity-pool-deposit.scss'

function LiquidityPoolDepositView() {
    const network = useStellarNetwork(),
        [valid, setValid] = useState(true),
        disabled = false,
        userAssets = accountLedgerData.balancesWithPriority.map(t => t.id),
        [deposit] = useDependantState(() => new LiquidityPoolDepositSettings(network), [network]),
        poolInfo = useLiquidityPoolInfo(deposit.poolId)

    return <WalletOperationsWrapperView title="Deposit funds to liquidity pool" action="Deposit"
                                        disabled={disabled} prepareTransaction={() => deposit.prepareTransaction()}
                                        onConfirm={() => deposit.resetOperationAmount()}>
        <div className="lp-deposit">
            <TransferAmountView settings={deposit} index={0} predefinedAssets={userAssets}/>
            <AvailableAmountLink settings={deposit} index={0}/>
            <div className="micro-space"/>
            <TransferAmountView settings={deposit} index={1} predefinedAssets={userAssets}/>
            <AvailableAmountLink settings={deposit} index={1}/>
            <SlippageView title="Slippage tolerance" defaultValue={1} max={50} step={1}
                          onChange={v => deposit.setSlippage(v)}/>
            <div className="segment text-small space">
                <LiquidityPoolInfoView settings={deposit} poolInfo={poolInfo}/>
            </div>
        </div>
    </WalletOperationsWrapperView>
}

export default observer(LiquidityPoolDepositView)