import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import {useLocation} from 'react-router'
import {isValidPoolId} from '@stellar-expert/asset-descriptor'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import {toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import TransferAmountView from '../shared/transfer-amount-view'
import SlippageView from '../shared/slippage-view'
import AvailableAmountLink from '../shared/available-amount-link-view'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TransactionConfirmationView from '../shared/transaction-confirmation-view'
import LiquidityPoolInfoView from './liquidity-pool-info-view'
import LiquidityPoolNonexistentView from './liquidity-pool-nonexistent-view'
import LiquidityPoolDepositSettings from './liquidity-pool-deposit-settings'
import {useLiquidityPoolInfo} from './liquidity-pool-info'
import './liquidity-pool-deposit.scss'

function LiquidityPoolDepositView() {
    useLocation()
    const network = useStellarNetwork()
    const userAssets = accountLedgerData.balancesWithPriority
    const [deposit] = useDependantState(() => new LiquidityPoolDepositSettings(network), [network])
    const disabled = !deposit.isValid
    const poolInfo = useLiquidityPoolInfo(deposit.poolId)
    const currentStake = toStroops(accountLedgerData.balances[deposit.poolId]?.balance || '0').toString()
    useEffect(() => {
        const {pool} = parseQuery()
        if (pool) {
            if (isValidPoolId(pool)) {
                deposit.loadPoolInfo(false, pool)
            }
            navigation.updateQuery({pool: undefined})
        }
    }, [])

    return <WalletOperationsWrapperView title="Deposit liquidity">
        <WalletPageActionDescription>
            deposit funds to the crowdsourced DEX liquidity pool
        </WalletPageActionDescription>
        <div className="lp-deposit space">
            <div className="segment">
                <TransferAmountView settings={deposit} index={0} balances={userAssets} restricted/>
                <AvailableAmountLink settings={deposit} index={0}/>
                <div className="micro-space"/>
                <TransferAmountView settings={deposit} index={1} balances={userAssets} restricted/>
                <AvailableAmountLink settings={deposit} index={1}/>
                <SlippageView title="Slippage tolerance" defaultValue={1} max={50} step={1}
                              onChange={v => deposit.setSlippage(v)}/>
            </div>
            {poolInfo === null && <LiquidityPoolNonexistentView assets={deposit.asset}/>}
            {poolInfo && <LiquidityPoolInfoView poolInfo={poolInfo} stake={currentStake}/>}
        </div>
        <TransactionConfirmationView action="Deposit" transfer={deposit} prepareTransaction={() => deposit.prepareTransaction()}
                                     onFinalize={() => navigation.navigate('/')} disabled={disabled} skipConfirmation/>
    </WalletOperationsWrapperView>
}

export default observer(LiquidityPoolDepositView)