import {observable, action, runInAction, computed} from 'mobx'
import {Transaction, Keypair, TransactionBuilder} from 'stellar-sdk'
import {intentInterface} from '@albedo-link/intent'
import accountManager from './account-manager'
import responder from '../actions/responder'
import {dispatchIntentResponse, handleIntentResponseError} from '../actions/callback-dispatcher'
import errors from '../util/errors'
import TxContext from './tx-context'
import {whitelist} from '../../implicit-flow-whitelist'
import {resolveNetworkParams} from '../util/network-resolver'
import {restoreImplicitSession} from '../storage/implicit-session-storage'
import {isImplicitIntentRequested} from '../ui/intent/implicit-intent-detector'
import {loadSelectedAccountInfo} from '../actions/account-info-loader'
import lastActionResult from './last-action-result'
import {setStellarNetwork} from './network-selector'

/**
 * Provides context for initiated action.
 */
class ActionContext {
    /**
     * Requested intent.
     * @type {String}
     */
    @observable
    intent = null

    /**
     * Request params.
     * @type {Object}
     */
    @observable.shallow
    intentParams = null

    @observable
    networkName = 'public'

    /**
     * Requested transaction context.
     * @type {TxContext}
     */
    @observable
    txContext = null

    /**
     * Intent confirmation status.
     * @type {boolean}
     */
    @observable
    confirmed = false

    /**
     * Whether action processed or not.
     * @type {Boolean}
     */
    @observable
    processed = false

    /**
     * Errors found during intent validation or execution.
     * @type {String}
     */
    @observable
    intentErrors = null

    /**
     * Temporary runtime error (non-blocking).
     * @type {String}
     */
    @observable
    runtimeErrors = null

    response = null

    @observable
    directKeyInput = false

    /**
     * Directly provided secret key (only for direct input case).
     * @type {String}
     */
    secret = null

    @observable
    selectedAccountInfo = null

    @observable
    dispatchingResponse = false

    /**
     * Contains information about the restored implicit session - only for intents requested in the implicit mode.
     * @type {Object}
     */
    implicitSession = null

    /**
     * An implicit intent mode has been requested if true
     * @type {Boolean}
     */
    get isImplicitIntent() {
        return !!this.implicitSession
    }

    get requiresExistingAccount() {
        return !['public_key', 'sign_message', 'implicit_flow'].includes(this.intent)
    }

    @computed
    get selectedPublicKey() {
        try {
            if (this.directKeyInput) {
                if (!this.secret) return null
                return Keypair.fromSecret(this.secret).publicKey()
            }
            return accountManager.activeAccount?.publicKey || null
        } catch (e) {
            console.error(e)
        }
    }

    @computed
    get hasNoMatchingKey() {
        const {pubkey} = this.intentParams
        return pubkey && !accountManager.accounts.some(acc => acc.publicKey === pubkey)
    }

    @computed
    get autoSubmitToHorizon() {
        return this?.intentParams?.submit || false
    }

    @action
    reset() {
        Object.assign(this, {
            intent: null,
            intentProps: null,
            intentParams: null,
            secret: null,
            txContext: null,
            response: null,
            intentErrors: null,
            runtimeErrors: null,
            confirmed: false,
            processed: false,
            implicitSession: null,
            dispatchingResponse: false
        })
    }

    /**
     * Set current context based on the request params.
     * @param {object} params - Intent request parameters.
     */
    @action
    async setContext(params) {
        this.reset()
        const {intent, ...intentParams} = params

        Object.assign(this, {
            intentErrors: null,
            confirmed: false,
            processed: false,
            intent,
            intentParams
        })
        //intent should be present
        if (!intent) {
            this.intentErrors = 'Parameter "intent" is required.'
            return this.rejectRequest()
        }
        /*if (account && !StrKey.isValidEd25519PublicKey(account)) {
            this.intentErrors = 'Invalid "account" parameter. Stellar account public key expected.'
            return
        }*/

        const {network, networkName} = resolveNetworkParams(intentParams)

        this.networkName = networkName

        this.intentProps = intentInterface[intent]
        if (!this.intentProps) {
            this.intentErrors = `Unknown intent "${intent}".`
            return this.rejectRequest()
        }
        const allowedParams = this.intentProps.params
        for (let param in allowedParams)
            if (allowedParams.hasOwnProperty(param)) {
                const descriptor = allowedParams[param],
                    value = intentParams[param]
                if (descriptor.required && !value) {
                    this.intentErrors = `Parameter "${param}" is required.`
                    return this.rejectRequest()
                }
            }

        //check whether we deal with an implicit intent
        if (isImplicitIntentRequested({intent, ...intentParams})) {
            //try to find corresponding session
            this.implicitSession = await restoreImplicitSession(intentParams.session)
        }

        //set transaction context in advance for the tx intent
        if (intent === 'tx') {
            const {network} = resolveNetworkParams(intentParams)
            try {
                const tx = TransactionBuilder.fromXDR(intentParams.xdr, network)
                await this.setTxContext(tx)
            } catch (e) {
                this.intentErrors = `Invalid transaction XDR`
                return this.rejectRequest()
            }
        }

        //validate implicit flow request preconditions
        if (intent === 'implicit_flow') {
            let {intents = [], app_origin} = intentParams
            if (app_origin !== window.origin && whitelist.length && !whitelist.includes(app_origin)) {
                this.intentErrors = `Origin "${app_origin}" is not allowed to request implicit flow permissions.`
                return this.rejectRequest()
            }
            if (typeof intents === 'string') {
                intents = intents.split(',')
            }
            if (!(intents instanceof Array) || !intents.length) {
                //TODO: reject intent immediately if possible
                this.intentErrors = `No intents were specified for the implicit mode.`
                return this.rejectRequest()
            }
            this.intentParams.intents = intents
            //check that intent exists and is allowed in the implicit mode
            for (let requestedIntent of intents) {
                const descriptor = intentInterface[requestedIntent]
                if (!descriptor) {
                    this.intentErrors = `Unknown intent requested: "${requestedIntent}".`
                    return this.rejectRequest()
                }
                if (!descriptor.implicitFlow) {
                    this.intentErrors = `Intent ${requestedIntent} can't be used in the implicit flow.`
                    return this.rejectRequest()
                }
            }
        }

        if (intent === 'manage_account') {
            const {pubkey} = intentParams
            const acc = accountManager.get(pubkey)
            if (!acc) return this.rejectRequest()
            await accountManager.setActiveAccount(acc)
            if (intentParams.network) {
                setStellarNetwork(networkName)
            }
        }
    }

    /**
     * Confirm the intent request.
     */
    @action
    async confirmRequest() {
        this.confirmed = true
        this.runtimeErrors = null
        try {
            this.response = await responder.process(this)
            if (!this.response) return
            if (!this.txContext || this.txContext.isFullySigned) {
                return await this.finalize()
            }
        } catch (e) {
            console.error(e)
            this.intentErrors = e

            if (this.isImplicitIntent) {
                return this.rejectRequest(e)
            }
        }
    }

    /**
     * Send response back to the caller window and reset action context state - only for interactive flow.
     * @return {Promise<Object>}
     */
    @action
    async finalize() {
        if (!this.intent) return //likely it was called after the response has been submitted
        try {
            if (!this.response)
                throw new Error('Tried to finalize the action without a response.')

            lastActionResult.setResult(this.response)
            this.dispatchingResponse = true
            const res = await dispatchIntentResponse(this.response, this)
            __history.push('/result')
            this.reset()
            return res
        } catch (e) {
            console.error(e)
            this.intentErrors = e
            this.reset()
        }
    }

    /**
     * Reject the request.
     * @param {Error} [error] - Rejection reason or validation error.
     */
    rejectRequest(error) {
        const {intent, intentErrors} = this
        if (!intent) return
        if (!error && intentErrors) {
            if (intentErrors.code === undefined) {
                error = errors.invalidIntentRequest(intentErrors)
            } else {
                error = intentErrors
            }
        }
        return handleIntentResponseError(error, this)
            .then(res => {
                this.reset()
                return res
            })
            .catch(e => {
                this.reset()
                return e
            })
    }

    /**
     * Cancel current action.
     */
    @action
    cancelAction() {
        //TODO: implement contextual action and nav path here
        __history.push('/')
    }

    /**
     * Prepare and set TxContext for supported intents.
     * @param {Transaction} transaction
     * @return {Promise<TxContext>}
     */
    @action
    async setTxContext(transaction) {
        //set tx context, retrieve network params from intent params
        const txContext = new TxContext(transaction, this.intentParams)
        //discover available signers using current account
        //TODO: update available signers when the activeAccount is changed
        const {activeAccount} = accountManager,
            availableSigners = !activeAccount ? [] : [activeAccount.publicKey]
        txContext.setAvailableSigners(availableSigners)
        try {
            await txContext.updateSignatureSchema()
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            actionContext.txContext = txContext
        })
        return txContext
    }

    @action
    loadSelectedAccountInfo() {
        loadSelectedAccountInfo(this)
            .then(info => runInAction(() => {
                this.selectedAccountInfo = info
            }))
    }
}

const actionContext = new ActionContext()

window.addEventListener('unload', function () {
    actionContext.rejectRequest()
})

export default actionContext
