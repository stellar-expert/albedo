import {makeAutoObservable, runInAction} from 'mobx'
import Bignumber from 'bignumber.js'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {estimateLiquidityPoolStakeValue} from'@stellar-expert/liquidity-pool-utils'
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

    poolInfo

    balanceExceeded = false

    get poolAssets() {
        if (!this.poolInfo) return null
        return this.poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset))
    }

    get max() {
        if (!this.poolInfo) return '0'
        return new Bignumber(accountLedgerData && accountLedgerData.balances[this.poolId]?.balance || '0')
            .mul(new Bignumber(10000000))
            .toString()
    }

    setAmount(amount) {
        const {max} = this
        if (amount < 0 || max === '0') {
            amount = '0'
        }
        this.balanceExceeded = new Bignumber(max).lt(new Bignumber(amount))
        this.amount = amount
    }

    getWithdrawalMinAmounts() {
        const {poolInfo, amount} = this
        if (!poolInfo?.reserves) return ['0', '0']
        const slippage = 1 / 100,
            amt = new Bignumber(amount || 0).div(10000000).mul(1 - slippage).toString()
        return estimateLiquidityPoolStakeValue(amt, poolInfo.reserves.map(r => r.amount), poolInfo.total_shares) || ['0', '0']
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