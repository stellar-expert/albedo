import React, {useCallback, useEffect} from 'react'
import {observer} from 'mobx-react'
import {useLocation} from 'react-router'
import {isValidPoolId} from '@stellar-expert/asset-descriptor'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import {toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import FeeView from '../shared/fee-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SlippageView from '../shared/slippage-view'
import AvailableAmountLink from '../shared/available-amount-link-view'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TransactionConfirmationView from '../shared/transaction-confirmation-view'
import {useLiquidityPoolInfo} from './liquidity-pool-info'
import LiquidityPoolInfoView from './liquidity-pool-info-view'
import LiquidityPoolNonexistentView from './liquidity-pool-nonexistent-view'
import LiquidityPoolDepositSettings from './liquidity-pool-deposit-settings'
import './liquidity-pool-deposit.scss'

export default observer(function LiquidityPoolDepositView() {
    useLocation()
    const network = useStellarNetwork()
    const userAssets = accountLedgerData.balancesWithPriority
    const [deposit] = useDependantState(() => new LiquidityPoolDepositSettings(network), [network])
    const disabled = !deposit.isValid
    const poolInfo = useLiquidityPoolInfo(deposit.poolId, [accountLedgerData.updated])
    const currentStake = toStroops(accountLedgerData.balances[deposit.poolId]?.balance || '0').toString()

    const onFinalize = useCallback(() => accountLedgerData.loadAccountInfo(), [accountLedgerData])

    useEffect(() => {
        const {pool} = parseQuery()
        if (pool) {
            if (isValidPoolId(pool)) {
                deposit.loadPoolInfo(false, pool)
            }
            navigation.updateQuery({pool: undefined})
        }
    }, [])

    return <WalletOperationsWrapperView title="Classic LP deposit">
        <WalletPageActionDescription>
            deposit funds to the Classic DEX liquidity pool
        </WalletPageActionDescription>
        <div className="lp-deposit space">
            <div className="segment">
                <TransferAmountView settings={deposit} index={0} balances={userAssets} restricted/>
                <AvailableAmountLink settings={deposit} index={0}/>
                <div className="micro-space"/>
                <TransferAmountView settings={deposit} index={1} balances={userAssets} restricted/>
                <AvailableAmountLink settings={deposit} index={1}/>
                <div className="dual-layout space">
                    <div>
                        <SlippageView title="Slippage tolerance" value={deposit.slippage} onChange={v => deposit.setSlippage(v)}/>
                    </div>
                    <div>
                        <FeeView transfer={deposit}/>
                    </div>
                </div>
            </div>
            {poolInfo === null && <LiquidityPoolNonexistentView assets={deposit.asset}/>}
            {poolInfo && <LiquidityPoolInfoView poolInfo={poolInfo} stake={currentStake}/>}
        </div>
        <TransactionConfirmationView action="Deposit" disabled={disabled} transfer={deposit}
                                     prepareTransaction={() => deposit.prepareTransaction()} onFinalize={onFinalize}/>
    </WalletOperationsWrapperView>
})