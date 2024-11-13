import {makeAutoObservable, runInAction} from 'mobx'
import {AssetDescriptor, generateLiquidityPoolId} from '@stellar-expert/asset-descriptor'
import {adjustPrecision, fromStroops, toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'
import {prepareLiquidityDepositTx} from './liquidity-pool-deposit-tx-builder'

export default class LiquidityPoolDepositSettings {
    constructor(network) {
        this.network = network
        this.amount = ['', '']
        this.asset = ['XLM', 'XLM']
        this.poolInfo = {loaded: false}
        makeAutoObservable(this)
    }

    network

    asset

    amount

    slippage = 1

    poolInfo

    reverse = false

    get poolId() {
        return generateLiquidityPoolId(this.asset)
    }

    get hasSufficientBalance() {
        return this.asset
            .map(asset => {
                const additionalBalance = asset === 'XLM' ? (this.hasPoolTrustline ? 0.6 : 0.1) : 0
                return toStroops(accountLedgerData.getAvailableBalance(asset, additionalBalance))
            })
            .every((balance, i) => balance >= toStroops(this.amount[i] || 0))
    }

    get hasPoolTrustline() {
        return !!accountLedgerData.balances[this.poolId]
    }

    get isValid() {
        return this.amount[0] > 0
            && this.amount[1] > 0
            && this.asset[0] != this.asset[1]
            && this.poolInfo?.loaded
            && this.hasSufficientBalance
    }

    setAsset(asset, index) {
        this.asset[index] = asset
        this.amount[index] = ''
        this.loadPoolInfo()
            .then(() => this.recalculate(1 - index))
    }

    setAmount(amount, index) {
        this.amount[index] = amount
        this.loadPoolInfo()
            .then(() => this.recalculate(index))
    }

    setSlippage(slippage) {
        this.slippage = slippage
    }

    loadPoolInfo(force = false, poolId = null) {
        if (this._poolInfoPromise && !force)
            return this._poolInfoPromise
        this.poolInfo = {loaded: false}
        this.reverse = false
        if (this.asset[0] === this.asset[1] && !poolId) {
            this.poolInfo = {loaded: true, invalidPair: true}
            return Promise.resolve()
        }
        if (!poolId) {
            poolId = this.poolId
        }
        this._poolInfoPromise = resolvePoolParams(this.network, poolId, true)
            .then(res => runInAction(() => {
                this.poolInfo = {loaded: true, parameters: res}
                if (res) {
                    if (this.asset.join() === 'XLM,XLM' && this.amount.every(a => !a)) {
                        this.asset = res.reserves.map(r => AssetDescriptor.parse(r.asset).toFQAN())
                    } else if (AssetDescriptor.parse(res.reserves[0].asset).toFQAN() !== AssetDescriptor.parse(this.asset[0]).toFQAN()) {
                        this.reverse = true
                    }
                }
                this._poolInfoPromise = undefined
            }))
        return this._poolInfoPromise
    }

    recalculate(sourceIndex) {
        if (!this.poolInfo.parameters)
            return
        let {reserves} = this.poolInfo.parameters
        if (parseFloat(reserves[0].amount) === 0 || parseFloat(reserves[1].amount) === 0)
            return
        if (this.reverse) {
            reserves = reserves.slice().reverse()
        }
        const counter = toStroops(this.amount[sourceIndex] || 0)
            * toStroops(reserves[1 - sourceIndex].amount)
            / toStroops(reserves[sourceIndex].amount)
        this.amount[1 - sourceIndex] = adjustPrecision(fromStroops(counter))
    }

    prepareTransaction() {
        return prepareLiquidityDepositTx(this)
    }

    resetOperationAmount() {
        this.amount = ['', '']
    }
}