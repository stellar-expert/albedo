import {autorun, runInAction, makeAutoObservable} from 'mobx'
import {Asset, Memo} from 'stellar-sdk'
import {debounce} from 'throttle-debounce'
import BigNumber from 'bignumber.js'
import {AssetDescriptor} from '@stellar-expert/ui-framework'
import {streamLedgers} from '../../../util/ledger-stream'
import {createHorizon} from '../../../util/horizon-connector'
import {encodeMemo} from '../../../util/memo'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {prepareTransferTx} from './transfer-tx-builder'

class TransferSettings {
    constructor(network, mode = 'direct') {
        this.network = network
        this.mode = mode
        this.asset = ['XLM', 'XLM']
        this.amount = ['0', '0']
        this.conversionSlippage = 0.5
        makeAutoObservable(this)

        autorun(() => {
            const {
                destination,
                mode,
                asset,
                amount,
                conversionDirection,
                conversionSlippage,
                currentLedgerSequence
            } = this
            this.recalculateSwap()
        })

        this.findConversionPath = debounce(400, false, this.findConversionPath.bind(this))
    }

    network
    /**
     * @type {TransferMode}
     */
    mode = 'direct'
    /**
     * @type {String}
     */
    destination
    /**
     * @type {String}
     */
    destinationFederationAddress
    /**
     * @type {Boolean}
     */
    createDestination = false
    /**
     * @type {Memo}
     */
    memo = null
    /**
     * @type {Boolean}
     */
    invalidMemo = false
    /**
     * @type {[String]}
     */
    asset
    /**
     * @type {[String]}
     */
    amount
    /**
     * @type {Boolean}
     */
    createTrustline
    /**
     * @type {'source'|'dest'}
     */
    conversionDirection
    /**
     * @type {Number}
     */
    conversionSlippage
    /**
     * @type {Array<Asset>}
     */
    conversionPath
    /**
     * @type {String}
     */
    conversionPrice
    /**
     * @type {Boolean}
     */
    conversionFeasible
    /**
     * @type {Boolean}
     */
    conversionPathLoaded = false
    /**
     * @type {Number}
     */
    currentLedgerSequence
    /**
     * @type {String}
     */
    get source() {
        return accountLedgerData.address
    }

    get isSelfPayment() {
        return this.source === this.destination
    }

    get hasSufficientBalance() {
        return new BigNumber(accountLedgerData.getAvailableBalance(this.asset[0]))
            .greaterThanOrEqualTo(this.amount[0] || 0)
    }

    /**
     *
     * @param {TransferMode} mode
     */
    setMode(mode) {
        this.mode = mode
        if (mode === 'claimable') {
            this.createDestination = false
            this.createTrustline = false
        }
        this.asset[1] = this.asset[0]
        this.conversionDirection = 'source'
    }

    setDestination(address, federationInfo = null) {
        this.destination = address || null
        this.createDestination = false
        this.createTrustline = false
        this.destinationFederationAddress = null
        this.memo = null
        this.invalidMemo = false
        if (federationInfo) {
            this.destinationFederationAddress = federationInfo.link
            this.memo = encodeMemo(federationInfo)
            this.invalidMemo = false
        }
    }

    /**
     *
     * @param {String} amount
     * @param {Number} index
     */
    setAmount(amount, index) {
        this.conversionDirection = index === 0 ? 'source' : 'dest'
        this.conversionPathLoaded = false
        if (this.asset[0] === this.asset[1]) {
            this.amount = [amount, amount]
        } else {
            this.amount[index] = amount
        }
    }

    setSlippage(slippage) {
        this.conversionPathLoaded = false
        this.conversionSlippage = slippage
    }

    setAsset(asset, index) {
        this.conversionPathLoaded = false
        this.createTrustline = false
        if (this.mode !== 'convert') {
            this.asset = [asset, asset]
            this.createDestination = false
            this.amount[1] = this.amount[0]
        } else {
            this.asset[index] = asset
            if (this.asset[0] === this.asset[1]) {
                this.amount[1] = this.amount[0]
            }
        }
    }

    reverse() {
        if (this.conversionDirection === 'source') {
            this.amount = ['0', this.amount[0]]
            this.conversionDirection = 'dest'
        } else {
            this.amount = [this.amount[1], '0']
            this.conversionDirection = 'source'
        }
        this.asset = this.asset.slice().reverse()
        this.createTrustline = false
        this.conversionPathLoaded = false
        this.createDestination = false
    }

    recalculateSwap() {
        if (this.conversionPathLoaded || this.mode !== 'convert') return
        this.conversionPath = undefined
        this.conversionPrice = undefined
        if (this.asset[0] === this.asset[1]) {
            this.conversionFeasible = true
            this.conversionPathLoaded = true
            return
        }
        this.conversionFeasible = false
        const target = this.conversionDirection === 'source' ? 1 : 0
        this.amount[target] = ''

        if (!this.amount[0] && !this.amount[1] || !this.conversionDirection) return
        this.findConversionPath()
    }

    findConversionPath() {
        const horizon = createHorizon(this.network)
        let endpoint
        if (this.conversionDirection === 'source') {
            if (!parseFloat(this.amount[0])) return
            endpoint = horizon.strictSendPaths(AssetDescriptor.parse(this.asset[0]).toAsset(), this.amount[0], [AssetDescriptor.parse(this.asset[1]).toAsset()])
        } else {
            if (!parseFloat(this.amount[1])) return
            endpoint = horizon.strictReceivePaths([AssetDescriptor.parse(this.asset[0]).toAsset()], AssetDescriptor.parse(this.asset[1]).toAsset(), this.amount[1])
        }
        return endpoint.call()
            .then(({records}) => {
                if (records.length) {
                    const [result] = records
                    runInAction(() => {
                        if (this.conversionDirection === 'source') {
                            this.amount[1] = adjustWithSlippage(result.destination_amount, -1, this.conversionSlippage)
                        } else {
                            this.amount[0] = adjustWithSlippage(result.source_amount, 1, this.conversionSlippage)
                        }
                        this.conversionPrice = result.destination_amount / result.source_amount
                        this.conversionPath = (result.path || []).map(a => a.asset_type === 'native' ? Asset.native() : new Asset(a.asset_code, a.asset_issuer))
                        this.conversionPathLoaded = true
                        this.conversionFeasible = true
                    })
                } else {
                    runInAction(() => {
                        this.conversionPathLoaded = true
                    })
                }
            })
            .catch(e => {
                this.conversionPathLoaded = true
                console.error(e)
            })
    }

    startLedgerStreaming() {
        this.stopLedgerStreaming = streamLedgers({
            network: this.network,
            onNewLedger: ({sequence}) => {
                this.currentLedgerSequence = sequence
            }
        })
    }

    resetOperationAmount() {
        this.amount = ['0', '0']
        this.setAmount('0', 0)
    }

    prepareTransaction() {
        return prepareTransferTx(this)
    }
}

export default TransferSettings


function adjustWithSlippage(value, direction, slippage) {
    return new BigNumber(value)
        .times((1 + direction * slippage / 100).toPrecision(15))
        .round(7, direction < 0 ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP)
        .toString()
}

/**
 * @typedef  {'direct'|'convert'|'claimable'} TransferMode
 */