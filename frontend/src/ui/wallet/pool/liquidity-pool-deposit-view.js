import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {useDependantState, useStellarNetwork, navigation} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
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
        userAssets = accountLedgerData.balancesWithPriority,
        [deposit] = useDependantState(() => new LiquidityPoolDepositSettings(network), [network]),
        disabled = !deposit?.hasSufficientBalance,
        poolInfo = useLiquidityPoolInfo(deposit.poolId)

    return <WalletOperationsWrapperView title="Deposit liquidity" action="Deposit" prepareTransaction={() => deposit.prepareTransaction()}
                                        disabled={disabled} onConfirm={() => deposit.resetOperationAmount()}
                                        onFinalize={() => navigation.navigate('/wallet/liquidity-pool')}>
        <div className="lp-deposit space">
            <TransferAmountView settings={deposit} index={0} balances={userAssets} restricted/>
            <AvailableAmountLink settings={deposit} index={0}/>
            <div className="micro-space"/>
            <TransferAmountView settings={deposit} index={1} balances={userAssets} restricted/>
            <AvailableAmountLink settings={deposit} index={1}/>
            <SlippageView title="Slippage tolerance" defaultValue={1} max={50} step={1}
                          onChange={v => deposit.setSlippage(v)}/>
            {poolInfo !== undefined && <LiquidityPoolInfoView poolInfo={poolInfo}/>}
        </div>
    </WalletOperationsWrapperView>
}

export default observer(LiquidityPoolDepositView)