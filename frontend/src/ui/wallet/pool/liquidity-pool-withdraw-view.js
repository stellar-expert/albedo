import React from 'react'
import {observer} from 'mobx-react'
import Bignumber from 'bignumber.js'
import {useLocation} from 'react-router'
import {
    navigation,
    Slider,
    isValidPoolId,
    useDependantState,
    useStellarNetwork,
    stripTrailingZeros,
    parseQuery, estimateLiquidityPoolStakeValue, adjustAmount
} from '@stellar-expert/ui-framework'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import SlippageView from '../shared/slippage-view'
import LiquidityPoolWithdrawSettings from './liquidity-pool-withdraw-settings'
import LiquidityPoolInfoView from './liquidity-pool-info-view'

function LiquidityPoolWithdrawView() {
    useLocation()
    const {pool} = parseQuery()
    if (!isValidPoolId(pool)) return <div className="space error text-center">
        <i className="icon icon-warning color-warning"/> Invalid liquidity pool id
    </div>

    const network = useStellarNetwork(),
        [withdraw] = useDependantState(() => new LiquidityPoolWithdrawSettings(network, pool), [network]),
        [inputAmount, setInputAmount] = useDependantState(() => {
            if (!withdraw.amount || withdraw.amount === '0') return ''
            return withdraw.amount
        }, [withdraw.amount]),
        disabled = withdraw.max === '0' || withdraw.amount === '0'

    function setPercentage(percentage) {
        if (withdraw.max === '0') return 0
        const v = new Bignumber(percentage || '0')
            .div(100)
            .mul(new Bignumber(withdraw.max))
            .toFixed(7)
        return withdraw.setAmount(stripTrailingZeros(v))
    }

    function changeAmount(e) {
        const v = e.target.value.replace(/[^\d.]/g, '')
        setInputAmount(v)
        try {
            const parsed = new Bignumber(v)
            if (parsed.isNegative() || parsed.isNaN()) throw new Error(`Invalid amount: ${v}`)
            const amt = stripTrailingZeros(parsed.toFixed(7, Bignumber.ROUND_DOWN))
            withdraw.setAmount(amt)
        } catch (e) {
            withdraw.setAmount('0')
        }
    }

    return <WalletOperationsWrapperView title="Withdraw liquidity" action="Withdraw"
                                        prepareTransaction={() => withdraw.prepareTransaction()}
                                        disabled={disabled} onConfirm={() => withdraw.setAmount('0')}
                                        onFinalize={() => navigation.navigate('/wallet/liquidity-pool')}>
        {withdraw.max === '0' ?
            <>
                <div className="dimmed text-center text-small space">
                    (no liquidity deposited)
                </div>
                <div className="space"/>
                {withdraw.poolInfo &&
                <LiquidityPoolInfoView poolInfo={withdraw.poolInfo} stake={withdraw.max}/>}
            </> :
            <div>
                {withdraw.poolInfo &&
                <LiquidityPoolInfoView poolInfo={withdraw.poolInfo} stake={withdraw.max}/>}
                <div className="space"/>
                <input type="text" placeholder="Stake amount to withdraw" onChange={changeAmount} value={inputAmount}/>
                <div className="text-tiny text-right" style={{paddingTop: '0.4em'}}>
                    {[10, 25, 50, 100].map(p => <span>&emsp;
                        <a href="#" className="dimmed" key={p} onClick={e => setPercentage(p)}>{p}%</a>
                    </span>)}
                </div>
                <SlippageView title="Slippage tolerance" defaultValue={withdraw.slippage} onChange={v => withdraw.setSlippage(v)}/>
            </div>}
    </WalletOperationsWrapperView>
}

export default observer(LiquidityPoolWithdrawView)