import {autorun, runInAction, makeAutoObservable} from 'mobx'
import {Asset, Memo} from 'stellar-sdk'
import BigNumber from 'bignumber.js'
import {streamLedgers} from '../../../util/ledger-stream'
import {wrapAsset} from '../../../util/wrap-asset'
import {createHorizon} from '../../../util/horizon-connector'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {prepareTransferTx} from './transfer-tx-builder'
import {encodeMemo} from '../../../util/memo'

class TransferSettings {
    constructor(network, mode = 'direct') {
        this.network = network
        this.mode = mode
        makeAutoObservable(this)

        this.sourceAsset = this.destAsset = 'XLM'
        this.conversionSlippage = 0.5

        autorun(() => {
            const {
                destination,
                mode,
                sourceAsset,
                destAsset,
                conversionDirection,
                sourceAmount,
                destAmount,
                conversionSlippage,
                currentLedgerSequence
            } = this
            this.recalculateSwap()
        })
    }

    network
    /**
     * @type {TransferMode}
     */
    mode = 'direct'

    /**
     * @type {String}
     */
    get source() {
        return accountLedgerData.address
    }

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
    memo
    /**
     * @type {String}
     */
    sourceAsset
    /**
     * @type {String}
     */
    sourceAmount
    /**
     * @type {String}
     */
    destAsset
    /**
     * @type {Boolean}
     */
    createTrustline
    /**
     * @type {String}
     */
    destAmount
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

    get isSelfPayment() {
        return this.source === this.destination
    }

    get hasSufficientBalance() {
        return new BigNumber(accountLedgerData.getAvailableBalance(this.sourceAsset))
            .greaterThanOrEqualTo(this.sourceAmount || 0)
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
        this.destAsset = this.sourceAsset
        this.conversionDirection = 'source'
    }

    setDestination(address, federationInfo = null) {
        this.destination = address || null
        this.createDestination = false
        this.createTrustline = false
        this.destinationFederationAddress = null
        this.memo = null
        if (federationInfo) {
            this.destinationFederationAddress = federationInfo.link
            this.memo = encodeMemo(federationInfo)
        }
    }

    /**
     *
     * @param {String} amount
     * @param {'source'|'dest'} direction
     */
    setAmount(amount, direction) {
        this.conversionDirection = direction
        this.conversionPathLoaded = false
        if (this.sourceAsset === this.destAsset) {
            this.sourceAmount = this.destAmount = amount
        } else {
            if (direction === 'source') {
                this.sourceAmount = amount
            } else {
                this.destAmount = amount
            }
        }
    }

    setSlippage(slippage) {
        this.conversionPathLoaded = false
        this.conversionSlippage = slippage
    }

    setAsset(asset, direction) {
        this.conversionPathLoaded = false
        this.createTrustline = false
        if (this.mode !== 'convert') {
            this.sourceAsset = this.destAsset = asset
            this.createDestination = false
            this.destAmount = this.sourceAmount
        } else {
            switch (direction) {
                case 'source':
                    this.sourceAsset = asset
                    break
                case 'dest':
                    this.destAsset = asset
                    break
            }
            if (this.sourceAsset === this.destAsset) {
                this.destAmount = this.sourceAmount
            }
        }
    }

    recalculateSwap() {
        if (this.conversionPathLoaded || this.mode !== 'convert') return
        this.path = undefined
        this.conversionPrice = undefined
        if (this.sourceAsset === this.destAsset) {
            this.conversionFeasible = true
            this.conversionPathLoaded = true
            return
        }
        this.conversionFeasible = false
        if (this.conversionDirection === 'source') {
            this.destAmount = ''
        } else {
            this.sourceAmount = ''
        }

        if (!this.sourceAsset || !this.destAsset || !this.conversionDirection) return
        this.findConversionPath()
    }

    reverseSwap(resetSourceAsset = false) {
        const {sourceAsset, sourceAmount, destAsset, destAmount, conversionDirection} = this
        this.destAsset = sourceAsset
        this.sourceAsset = resetSourceAsset ? 'XLM' : destAsset
        if (conversionDirection === 'dest') {
            this.setAmount(destAmount, 'source')
        } else {
            this.setAmount(sourceAmount, 'dest')
        }
    }

    findConversionPath() {
        const horizon = createHorizon(this.network)
        let endpoint
        if (this.conversionDirection === 'source') {
            if (!this.sourceAmount) return
            endpoint = horizon.strictSendPaths(wrapAsset(this.sourceAsset), this.sourceAmount, [wrapAsset(this.destAsset)])
        } else {
            if (!this.destAmount) return
            endpoint = horizon.strictReceivePaths([wrapAsset(this.sourceAsset)], wrapAsset(this.destAsset), this.destAmount)
        }
        return endpoint.call()
            .then(({records}) => {
                if (records.length) {
                    const [result] = records
                    runInAction(() => {
                        if (this.conversionDirection === 'source') {
                            this.destAmount = adjustWithSlippage(result.destination_amount, -1, this.conversionSlippage)
                        } else {
                            this.sourceAmount = adjustWithSlippage(result.source_amount, 1, this.conversionSlippage)
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