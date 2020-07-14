import {observable, action, runInAction, computed} from 'mobx'
import {Transaction} from 'stellar-sdk'
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

/**
 * Provides context for initiated action.
 */
class ActionContext {
    @computed
    get isImplicitIntent() {
        if (!isImplicitIntentRequested({intent: this.intent, ...this.intentParams})) return false
        //try to find corresponding session
        if (!restoreImplicitSession(this.intentParams.session)) return false
        //looks ok
        return true
    }

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

    response = null

    /**
     * Directly provided secret key (only for direct input case).
     * @type {String}
     */
    secret = null

    @computed
    get autoSubmitToHorizon() {
        return this?.intentParams?.submit || false
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

        //set transaction context in advance for the tx intent
        if (intent === 'tx') {
            const {network} = resolveNetworkParams(intentParams)
            const tx = new Transaction(intentParams.xdr, network)
            await this.setTxContext(tx)
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
            confirmed: false,
            processed: false
        })
    }

    @computed
    get isFinalized() {
        return this.confirmed && !!this.response
    }

    /**
     * Confirm the intent request.
     */
    @action
    async confirmRequest() {
        this.confirmed = true
        try {
            this.response = await responder.process(this)
            if (!this.response) return
            if (!this.txContext || this.txContext.isFullySigned) {
                //TODO: do not auto-submit tx to the network
                return await this.finalize()
            }
        } catch (e) {
            console.error(e)
            this.intentErrors = e.message

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
            const res = await dispatchIntentResponse(this.response, this)
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
        if (!this.intent) return
        if (!error && this.intentErrors) {
            error = errors.invalidIntentRequest(this.intentErrors)
        }
        return handleIntentResponseError(error || errors.actionRejectedByUser, this)
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
}

const actionContext = new ActionContext()

window.addEventListener('unload', function () {
    actionContext.rejectRequest()
})

export default actionContext
