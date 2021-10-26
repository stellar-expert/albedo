import {makeAutoObservable} from 'mobx'
import {generateLiquidityPoolId} from '../../../util/liquidity-pool-id'

export default class LiquidityPoolDepositSettings {
    constructor(network) {
        this.network = network
        this.amount = ['0', '0']
        this.asset = ['XLM', 'XLM']
        makeAutoObservable(this)
    }

    network

    asset

    amount

    slippage

    get poolId() {
        return generateLiquidityPoolId(this.asset)
    }

    setAsset(asset, index) {
        this.asset[index] = asset
    }

    setAmount(amount, index) {
        this.amount[index] = amount
    }

    setSlippage(slippage) {
        this.slippage = slippage
    }
}