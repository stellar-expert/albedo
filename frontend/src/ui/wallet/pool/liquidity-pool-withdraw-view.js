import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import Bignumber from 'bignumber.js'
import {useLocation} from 'react-router'
import {Amount, useAutoFocusRef, useDependantState, useStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {AssetDescriptor, isValidPoolId} from '@stellar-expert/asset-descriptor'
import {stripTrailingZeros} from '@stellar-expert/formatter'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import LiquidityPoolWithdrawSettings from './liquidity-pool-withdraw-settings'
import LiquidityPoolInfoView from './liquidity-pool-info-view'

function LiquidityPoolWithdrawView() {
    useLocation()
    const {pool} = parseQuery()
    if (!isValidPoolId(pool))
        return <div className="segment error text-center">
            <i className="icon icon-warning-hexagon color-warning"/> Error: Invalid liquidity pool id
        </div>

    const network = useStellarNetwork()
    const [withdraw] = useDependantState(() => new LiquidityPoolWithdrawSettings(network, pool), [network])
    const {poolInfo, amount, max} = withdraw
    const [inputAmount, setInputAmount] = useDependantState(() => !amount || amount === '0' ? '' : amount, [withdraw.amount])
    const disabled = withdraw.max === '0' || withdraw.amount === '0' || withdraw.balanceExceeded

    function setPercentage(percentage) {
        if (withdraw.max === '0') return 0
        const v = new Bignumber(percentage || '0')
            .div(100)
            .mul(new Bignumber(withdraw.max))
            .round()
            .toString()
        return withdraw.setAmount(stripTrailingZeros(v))
    }

    function changeAmount(e) {
        const v = e.target.value.replace(/[^\d]/g, '')
        setInputAmount(v)
        try {
            const parsed = new Bignumber(v)
            if (parsed.isNegative() || parsed.isNaN())
                throw new Error(`Invalid amount: ${v}`)
            const amt = stripTrailingZeros(parsed.toFixed(7, Bignumber.ROUND_DOWN))
            withdraw.setAmount(amt)
        } catch (e) {
            withdraw.setAmount('0')
        }
    }

    return <WalletOperationsWrapperView title="Withdraw liquidity" action="Withdraw" disabled={disabled}
                                        prepareTransaction={() => withdraw.prepareTransaction()}
                                        onFinalize={() => navigation.navigate('/')}>
        <WalletPageActionDescription>
            withdraw funds from the DEX liquidity pool
        </WalletPageActionDescription>
        {max === '0' ?
            <>
                <div className="segment dimmed text-center text-small space">
                    (no liquidity deposited)
                </div>
                {poolInfo && <LiquidityPoolInfoView poolInfo={poolInfo} stake={max}/>}
            </> :
            <>
                {poolInfo && <LiquidityPoolInfoView poolInfo={poolInfo} stake={max}/>}
                <div className="segment space">
                    <input type="text" onChange={changeAmount} value={inputAmount} ref={useAutoFocusRef}
                           placeholder="Stake amount to withdraw"/>
                    <div className="dual-layout text-tiny condensed micro-space">
                        <div>
                            {inputAmount > 0 && !!poolInfo.reserves && <div className="block-indent">
                                {withdraw.getWithdrawalMinAmounts().map((amount, i) => <div key={i}>
                                    ~<Amount amount={amount} decimals="auto" asset={AssetDescriptor.parse(poolInfo.reserves[i].asset)}/>
                                </div>)}
                            </div>}
                        </div>
                        <div>
                            {[10, 25, 50, 100].map(p => <span key={p}>{p !== 10 && <>&emsp;</>}
                                <a href="#" className="dimmed" key={p} onClick={e => setPercentage(p)}>{p}%</a>
                    </span>)}
                        </div>
                    </div>
                </div>
            </>}
    </WalletOperationsWrapperView>
}

export default observer(LiquidityPoolWithdrawView)