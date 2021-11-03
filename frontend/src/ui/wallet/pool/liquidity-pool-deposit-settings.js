import {makeAutoObservable, runInAction} from 'mobx'
import Bignumber from 'bignumber.js'
import {adjustAmount, generateLiquidityPoolId, AssetDescriptor} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {prepareLiquidityDepositTx} from './liquidity-pool-deposit-tx-builder'
import {resolvePoolParams} from '../../../util/liquidity-pool-params-resolver'

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
                return new Bignumber(accountLedgerData.getAvailableBalance(asset, additionalBalance))
            })
            .every((balance, i) => balance.greaterThanOrEqualTo(this.amount[i] || 0))
    }

    get hasPoolTrustline() {
        return !!accountLedgerData.balances[this.poolId]
    }

    setAsset(asset, index) {
        this.asset[index] = asset
        this.amount = ['', '']
        this.loadPoolInfo()
    }

    setAmount(amount, index) {
        this.amount[index] = amount
        this.loadPoolInfo()
            .then(() => this.recalculate(index))
    }

    setSlippage(slippage) {
        this.slippage = slippage
    }

    loadPoolInfo(force = false) {
        if (this._poolInfoPromise && !force) return this._poolInfoPromise
        this.poolInfo = {loaded: false}
        this.reverse = false
        if (this.asset[0] === this.asset[1]) {
            this.poolInfo = {loaded: true, invalidPair: true}
            return Promise.resolve()
        }

        this._poolInfoPromise = resolvePoolParams(this.network, this.poolId, true)
            .then(res => runInAction(() => {
                this.poolInfo = {loaded: true, parameters: res}
                if (res && AssetDescriptor.parse(res.reserves[0].asset).toFQAN() !== AssetDescriptor.parse(this.asset[0]).toFQAN()) {
                    this.reverse = true
                }
                this._poolInfoPromise = undefined
            }))
        return this._poolInfoPromise
    }

    recalculate(sourceIndex) {
        if (!this.poolInfo.parameters) return
        let {reserves} = this.poolInfo.parameters
        if (parseFloat(reserves[0].amount) === 0 || parseFloat(reserves[1].amount) === 0) return
        if (this.reverse) {
            reserves = reserves.slice().reverse()
        }
        const counter = new Bignumber(this.amount[sourceIndex])
            .mul(new Bignumber(reserves[1 - sourceIndex].amount))
            .div(new Bignumber(reserves[sourceIndex].amount))
        this.amount[1 - sourceIndex] = adjustAmount(counter)
    }

    prepareTransaction() {
        return prepareLiquidityDepositTx(this)
    }

    resetOperationAmount() {
        this.amount = ['', '']
    }
}