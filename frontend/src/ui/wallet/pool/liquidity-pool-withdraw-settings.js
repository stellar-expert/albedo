import {makeAutoObservable, runInAction} from 'mobx'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {estimateLiquidityPoolStakeValue} from '@stellar-expert/liquidity-pool-utils'
import {fromStroops, toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import {withSlippage} from '../../../util/slippage'
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

    fee

    balanceExceeded = false

    slippage = 1

    get poolAssets() {
        if (!this.poolInfo)
            return null
        return this.poolInfo.reserves.map(r => AssetDescriptor.parse(r.asset))
    }

    get max() {
        if (!this.poolInfo)
            return '0'
        return toStroops(accountLedgerData && accountLedgerData.balances[this.poolId]?.balance || '0')
    }

    setAmount(amount) {
        const {max} = this
        if (amount < 0n || !max) {
            amount = 0n
        }
        this.balanceExceeded = max < amount
        this.amount = amount
    }

    getWithdrawalMinAmounts() {
        const {poolInfo, amount} = this
        if (!poolInfo?.reserves)
            return ['0', '0']
        const amt = (amount || 0n) * BigInt(100 - this.slippage) / 100n
        return estimateLiquidityPoolStakeValue(fromStroops(amt), poolInfo.reserves.map(r => fromStroops(r.amount)), fromStroops(poolInfo.total_shares)) || ['0', '0']
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