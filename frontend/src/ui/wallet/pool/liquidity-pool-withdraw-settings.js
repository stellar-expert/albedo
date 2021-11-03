import {makeAutoObservable, runInAction} from 'mobx'
import Bignumber from 'bignumber.js'
import {AssetDescriptor, estimateLiquidityPoolStakeValue} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import {prepareLiquidityWithdrawTx} from './liquidity-pool-withdraw-tx-builder'

export default class LiquidityPoolWithdrawSettings {
    constructor(network, poolId) {
        this.network = network
        this.poolId = poolId
        this.share = '0'
        this.poolInfo = {loaded: false}
        makeAutoObservable(this)
        this.loadPoolInfo()
    }

    network

    poolId

    amount

    slippage = 1

    poolInfo

    get poolAssets() {
        if (!this.poolInfo) return null
        return this.poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset))
    }

    get max() {
        if (!this.poolInfo) return '0'
        return accountLedgerData && accountLedgerData.balances[this.poolId]?.balance || '0'
    }

    setAmount(amount) {
        if (amount < 0 || !this.max || parseFloat(this.max) < parseFloat(amount)) {
            amount = '0'
        }
        this.amount = amount
    }

    setSlippage(slippage) {
        this.slippage = slippage
    }

    getWithdrawalMinAmounts() {
        const {poolInfo, amount, slippage} = this
        if (!poolInfo) return
        return estimateLiquidityPoolStakeValue(new Bignumber(amount).mul(1 - slippage / 100), poolInfo.reserves.map(r => r.amount), poolInfo.total_shares)
    }

    loadPoolInfo(force = false) {
        if (this._poolInfoPromise && !force) return this._poolInfoPromise
        this.poolInfo = undefined
        if (!this.poolId) return Promise.resolve()
        this._poolInfoPromise = resolvePoolParams(this.network, this.poolId, true)
            .then(res => runInAction(() => {
                this.poolInfo = res
                this._poolInfoPromise = undefined
            }))
        return this._poolInfoPromise
    }

    prepareTransaction() {
        return prepareLiquidityWithdrawTx(this)
    }
}