import {runInAction, makeAutoObservable} from 'mobx'
import {debounce} from 'throttle-debounce'
import {Horizon} from '@stellar/stellar-sdk'
import {Asset, Keypair, TransactionBuilder, Networks} from '@stellar/stellar-base'
import {navigation} from '@stellar-expert/navigation'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {fromStroops, toStroops} from '@stellar-expert/formatter'
import {StellarBrokerClient} from '@stellar-broker/client'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import authorization from '../../../state/auth/authorization'
import accountManager from '../../../state/account-manager'
import {createHorizon} from '../../../util/horizon-connector'
import {streamLedgers} from '../../../util/ledger-stream'
import {prepareTransferTx} from '../transfer/transfer-tx-builder'
import {validateSwap} from './swap-validator'

export default class SwapSettings {
    constructor(network) {
        if (!network)
            return
        this.network = network
        this.asset = ['XLM', 'XLM']
        this.amount = ['0', '0']
        this.conversionSlippage = 1
        this.fee = 'normal'
        this.useStellarBroker = network === 'public' && !(localStorage.getItem('useStellarBroker') === '0')
        makeAutoObservable(this)

        this.recalculateSwap = debounce(400, this.recalculateSwap.bind(this))
        //obtain credentials
        authorization.requestAuthorization(accountManager.activeAccount)
            .then(credentials => {
                this.keypair = Keypair.fromSecret(credentials.requestAccountSecret())
            })
            .catch(e => {
                navigation.navigate('/')
            })
    }

    /**
     * @type {string}
     */
    network
    /**
     * @type {StellarBrokerClient}
     */
    brokerClient
    /**
     * @type {[String]}
     */
    asset
    /**
     * @type {[String]}
     */
    amount
    /**
     * @type {'source'|'dest'}
     */
    conversionDirection
    /**
     * @type {Number}
     */
    conversionSlippage
    /**
     * @type {Number}
     */
    conversionPrice
    /**
     * @type {Boolean}
     */
    conversionFeasible
    /**
     * @type {Asset[]}
     */
    conversionPath
    /**
     * @type {Boolean}
     */
    conversionPathLoaded = false
    /**
     * @type {Number | String}
     */
    fee
    /**
     * @type {Boolean}
     */
    useStellarBroker
    /**
     * @type {string}
     */
    brokerError
    /**
     * @type {String}
     */
    profit
    /**
     * @type {String}
     */
    validationStatus = 'Not initialized'
    /**
     * @type {{}}
     */
    quote
    /**
     * @type {String}
     * @private
     */
    bought
    /**
     * @type {boolean}
     */
    inProgress = false
    /**
     * @type {boolean}
     */
    createTrustline = false

    /**
     * @type {String}
     */
    get source() {
        return accountManager.activeAccount.publicKey
    }

    get mode() {
        return 'convert'
    }

    get destination() {
        return this.source
    }

    get hasSufficientBalance() {
        const asset = this.asset[0]
        const available = toStroops(accountLedgerData.getAvailableBalance(asset, asset === 'XLM' ? 1 : 0))
        const required = toStroops(this.amount[0] || 0)
        return available >= required
    }

    get isValid() {
        return !this.validationStatus
    }

    /**
     * @type {Boolean}
     */
    get usePathPayment() {
        if (!this.useStellarBroker)
            return true
        //always use direct path payment if it has better estimated conversion rate
        return toStroops(this.quote.directTrade?.buying || '0') >= toStroops(this.quote.estimatedBuyingAmount || '0')
    }

    /**
     * Set transfer tokens amount
     * @param {String} amount
     * @param {Number} index
     */
    setAmount(amount, index) {
        this.conversionDirection = index === 0 ? 'source' : 'dest'
        this.amount[index] = amount
        this.recalculateSwap()
    }

    /**
     * Maximum allowed price slippage
     * @param {Number} slippage
     */
    setSlippage(slippage) {
        this.conversionSlippage = slippage
        this.recalculateSwap()
    }

    /**
     * Set fee transfer
     * @param {Number | String} fee
     */
    setFee(fee) {
        this.fee = fee
        this.recalculateSwap()
    }

    /**
     * Set asset transfer
     * @param {String|AssetDescriptor} asset
     * @param {Number} index
     */
    setAsset(asset, index) {
        this.asset[index] = asset
        if (this.asset[0] === this.asset[1]) {
            this.amount[index] = this.amount[1 - index]
        }
        this.recalculateSwap()
    }

    /**
     * Whether to use smart swaps
     * @param {boolean} use
     */
    setUseStellarBroker(use = true) {
        this.useStellarBroker = use
        if (use) {
            localStorage.removeItem('useStellarBroker')
            this.stopLedgerStreaming && this.stopLedgerStreaming()
        } else {
            localStorage.setItem('useStellarBroker', '0')
        }
        this.recalculateSwap()
    }

    /**
     * Reverse swap direction
     */
    reverse() {
        if (this.inProgress)
            return
        this.amount = [this.amount[1] || '0', '0']
        this.asset = this.asset.slice().reverse()
        this.recalculateSwap()
    }

    /**
     * Reset estimated swap
     */
    reset() {
        this.conversionPath = undefined
        this.conversionPrice = undefined
        this.conversionFeasible = false
        this.conversionPathLoaded = false
        this.createTrustline = false
        this.profit = undefined
        this.brokerError = undefined
        this.inProgress = false
        const target = this.conversionDirection === 'source' ? 1 : 0
        this.amount[target] = ''
        this.validationStatus = validateSwap(this)
    }

    /**
     * Estimate swap price and amount
     */
    recalculateSwap() {
        this.reset()
        const {brokerClient} = this
        if (!this.isValid) {
            brokerClient?.stop()
            return
        }
        const quoteParams = {
            sellingAsset: this.asset[0],
            buyingAsset: this.asset[1],
            sellingAmount: this.amount[0] || undefined,
            slippageTolerance: this.conversionSlippage / 100
        }
        const aqp = process.env.STELLAR_BROKER_QP
        if (aqp) {
            const [key, value] = aqp.split(':')
            quoteParams[key] = value
        }
        if (this.stopLedgerStreaming) {
            this.stopLedgerStreaming()
        }
        if (this.useStellarBroker) {
            if (!brokerClient || brokerClient.status === 'disconnected') {
                this.connectToBroker()
                    .then(() => this.brokerClient.quote(quoteParams))
            } else {
                brokerClient.quote(quoteParams)
            }
        } else {
            if (brokerClient) {
                brokerClient.stop()
                setTimeout(() => brokerClient.close(), 50)
                this.brokerClient = undefined
            }
            this.findConversionPath()
            this.startLedgerStreaming()
        }
    }

    /**
     * Set amounts to zero
     */
    resetOperationAmount() {
        this.amount = ['0', '0']
        this.setAmount('0', 0)
    }

    /**
     * Confirm the quote provided by the smart router
     */
    confirmSmartRouterSwap() {
        this.brokerClient.confirmQuote()
        this.inProgress = true
    }

    /**
     * Connect to smart router broker
     * @param {string} network
     * @return {Promise<void>}
     */
    async connectToBroker(network) {
        //obtain user credentials
        const {source} = this
        const client = new StellarBrokerClient({
            partnerKey: process.env.STELLAR_BROKER_KEY,
            network,
            account: source,
            authorization: async payload => {
                //sign
                if (payload.toEnvelope) { //transaction
                    payload = TransactionBuilder.fromXDR(payload.toEnvelope().toXDR('base64'), Networks.PUBLIC)
                    payload.sign(this.keypair)
                    return payload.toEnvelope().toXDR('base64')
                }
                //auth entry
                return this.keypair.sign(payload)
            }
        })
        if (process.env.STELLAR_BROKER_ORIGIN) {
            client.origin = process.env.STELLAR_BROKER_ORIGIN
        }
        //subscribe to the quote notifications
        client.on('quote', e => {
            if (location.hostname === 'localhost') {
                compareWithHorizon(this, e.quote)
            }
            if (e.quote.directTrade) {
                this.conversionPath = e.quote.directTrade.path.map(a => {
                    if (a === 'XLM')
                        return Asset.native()
                    const [code, issuer] = a.split('-')
                    return new Asset(code, issuer)
                })
            }
            runInAction(() => {
                this.quote = e.quote
                const estimated = parseFloat(e.quote.directTrade?.buying) >= parseFloat(e.quote.estimatedBuyingAmount) ?
                    this.quote.directTrade.buying :
                    this.quote.estimatedBuyingAmount
                this.amount[1] = estimated
                this.conversionPathLoaded = true
                this.conversionFeasible = e.quote.status === 'success' || !!e.quote.directTrade
                this.conversionPrice = parseFloat(estimated) / parseFloat(e.quote.sellingAmount)
                if (e.quote.profit > 0) {
                    this.profit = e.quote.profit
                }
                if (e.quote.status !== 'success') {
                    this.brokerError = e.quote.error
                }
            })
        })
        client.on('finished', e => {
            console.log('Trade finished', e.result)
            const tradeResult = `${e.result.sold} ${this.quote.sellingAsset.split('-')[0]} → ${e.result.bought} ${this.quote.buyingAsset.split('-')[0]}`
            switch (e.result.status) {
                case 'success':
                    notify({type: 'success', message: 'Swapped ' + tradeResult})
                    break
                case 'cancelled':
                    if (parseFloat(e.result.sold) > 0) {
                        notify({type: 'warning', message: 'Swap executed partially: ' + tradeResult})
                    } else {
                        notify({type: 'info', message: 'Swap cancelled'})
                    }
                    break
            }
            this.resetOperationAmount()
            refreshBalances()
        })
        client.on('paused', e => {
            confirm('Quotation paused due to the inactivity. Load fresh price quotes?', {
                title: 'Are you still here?'
            })
                .then(() => this.recalculateSwap())
                .catch(e => this.setAmount('0', 0))
        })
        client.on('progress', e => {
            console.log('Progress', e.status)
            if (parseFloat(e.status.bought) > parseFloat(this.bought || 0)) { //TODO: calculate and show percentage
                refreshBalances()
            }
            this.bought = e.status.bought
        })
        client.on('error', e => {
            //TODO: use "swap error prefix conditionally"
            notify({type: 'warning', message: 'Swap error. ' + e.error})
            console.warn('Broker error', e.error)
            if (client.status === 'disconnected') {
                this.reset()
            }
        })
        this.brokerClient = client
        //connect...
        await client.connect()
            .catch(e => {
                console.error(e)
                notify({type: 'warning', message: 'Failed to connect to StellarBroker smart router. Try disabling Smart Routing option.'})
            })
    }

    /**
     * Find path payment path
     */
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
                        this.amount[1] = result.destination_amount
                        this.conversionPrice = result.destination_amount / result.source_amount
                        this.conversionPath = (result.path || []).map(a => a.asset_type === 'native' ?
                            Asset.native() :
                            new Asset(a.asset_code, a.asset_issuer))
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

    /**
     * Trigger price and amount estimates when new ledger arrives
     */
    startLedgerStreaming() {
        const stopCallback = streamLedgers({
            network: this.network,
            onNewLedger: ({sequence}) => {
                if (!this.isValid || this.useStellarBroker)
                    return this.stopLedgerStreaming && this.stopLedgerStreaming()
                this.findConversionPath()
            }
        })
        this.stopLedgerStreaming = () => {
            stopCallback()
            this.stopLedgerStreaming = undefined
        }
    }

    /**
     * Build swap transaction
     * @return {Promise<Transaction>}
     */
    prepareTransaction() {
        return prepareTransferTx(this)
    }

    dispose() {
        if (this.brokerClient) {
            this.brokerClient.close()
            this.brokerClient = undefined
        }
        if (this.stopLedgerStreaming) {
            this.stopLedgerStreaming()
        }
    }
}

function refreshBalances() {
    accountLedgerData.loadAccountInfo()
    setTimeout(() => accountLedgerData.loadAccountInfo(), 3000)
}

function compareWithHorizon(swapSetting, quote) {
    if (quote.error)
        return logQuote(quote, null)
    const horizon = new Horizon.Server('https://horizon.stellar.org/')
    const query = quote.direction === 'strict_send' ?
        horizon.strictSendPaths(AssetDescriptor.parse(quote.sellingAsset).toAsset(), quote.sellingAmount, [AssetDescriptor.parse(quote.buyingAsset).toAsset()]) :
        horizon.strictReceivePaths([AssetDescriptor.parse(quote.sellingAsset).toAsset()], AssetDescriptor.parse(quote.buyingAsset).toAsset(), quote.buyingAmount)
    query
        .limit(2)
        .call()
        .then(res => {
            logQuote(quote, res.records[0])
        })
}

function logQuote(quote, horizonPath) {
    if (quote.error) {
        console.warn(quote.error)
        return
    }
    let broker = `StellarBroker:  ${quote.estimatedSellingAmount || quote.sellingAmount} > ${quote.estimatedBuyingAmount || quote.buyingAmount}`
    console.log(broker)
    const direct = quote.directTrade ? `StellarBroker direct: ${quote.directTrade.selling} [${quote.directTrade.path.map(p => p.split('-')[0]).join('>')}] ${quote.directTrade.buying}` : ''
    let diff = quote.estimatedBuyingAmount ?
        quote.estimatedBuyingAmount / quote.directTrade.buying :
        quote.estimatedSellingAmount / quote.directTrade.selling
    diff = ((diff - 1) * 100).toPrecision(3) + '%'
    broker += ` ${diff}\n`
    if (quote.trades) {
        broker += quote.trades.map((t, i) => {
            const path = t.path.map(p => {
                const parts = p.split(':')
                let platform = i === 0 ? '' : 'dex'
                if (parts.length > 1) {
                    platform = parts[0].split('-')[0]
                }
                return platform + ':' + parts.pop().split('-')[0]
            })
            return `  ${t.sold / 10000000} → [${path.join(',')}] → ${t.bought / 10000000}`
        }).join('\n')
    }
    const horizonQuote = horizonPath ? `Horizon direct:       ${horizonPath.source_amount} [${horizonPath.path.map(p => p.asset_code || 'XLM').join('>')}] ${horizonPath.destination_amount}` : ''
    const formatted = `%c[${new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}]%c
${broker}
${direct}
${horizonQuote}`
    console.log(formatted, 'color:darkcyan', 'color:lightgray')
}