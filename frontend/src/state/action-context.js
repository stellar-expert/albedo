import {observable, action, runInAction, computed, makeObservable} from 'mobx'
import {Transaction, Keypair} from 'stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {processIntents} from '../actions/responder'
import {dispatchIntentResponse, dispatchIntentError} from '../actions/callback-dispatcher'
import {loadSelectedAccountInfo} from '../actions/account-info-loader'
import {submitTxIntents} from '../actions/tx-submit-handler'
import errors from '../util/errors'

/**
 * @enum {Number}
 */
export const ActionContextStatus = {
    /** Not initialized */
    empty: 0,
    /** Waiting for user's approval */
    pending: 1,
    /** Confirmed, processing intents */
    confirmed: 2,
    /** All intents processed */
    processed: 3,
    /** Submitted to Horizon (if requested) */
    submitted: 4,
    /** Dispatching execution result to a caller */
    dispatched: 5,
    /** Rejected by a user */
    rejected: -1,
    /** Error occurred */
    error: -2
}

/**
 * Provides context for initiated action.
 */
class ActionContext {
    constructor() {
        makeObservable(this, {
            status: observable,
            intentRequests: observable,
            origin: observable,
            networkParams: observable,
            intentParams: observable.shallow,
            intentErrors: observable,
            runtimeErrors: observable,
            requestedPubkey: observable,
            selectedAccount: observable,
            selectedAccountInfo: observable,
            isBatchRequest: computed,
            reset: action,
            setIntentError: action,
            confirmRequest: action,
            setStatus: action,
            selectAccount: action,
            cancelAction: action,
            loadSelectedAccountInfo: action
        })
    }

    /**
     * Current request status.
     * @type {ActionContextStatus}
     */
    status = ActionContextStatus.empty

    /**
     * Actions requested by a user.
     * @type {IntentRequest[]}
     */
    intentRequests = []

    /**
     * Network identifier.
     * @type {StellarNetworkParams}
     */
    networkParams

    /**
     * Origin of the caller app.
     */
    origin

    /**
     * Original request params.
     * @type {Object}
     */
    intentParams

    /**
     * Public key requested by application.
     * @type {String}
     */
    requestedPubkey

    /**
     * Errors thrown during intent validation or execution.
     * @type {String}
     */
    intentErrors = null

    /**
     * Temporary runtime errors (non-blocking).
     * @type {String}
     */
    runtimeErrors = null

    /**
     * Result generated during intents execution.
     * @type {Object}
     */
    result = null

    /**
     * Unique identifier of the external request.
     * @type {String}
     */
    requestId = null

    /**
     * Account that will be used for signing intents.
     * @type {Account}
     */
    selectedAccount = null

    /**
     * Horizon info for selected account.
     * @type {AccountResponse}
     */
    selectedAccountInfo = null

    /**
     * Contains information about the restored implicit session - only for intents requested in the implicit mode.
     * @type {DecryptedImplicitSession}
     */
    implicitSession = null

    get intent() {
        return this.intentParams?.intent
    }

    get requiresExistingAccount() {
        return !['public_key', 'sign_message', 'implicit_flow', 'tx'].includes(this.intent)
    }

    get isBatchRequest() {
        return this.intent === 'batch'
    }

    reset() {
        Object.assign(this, {
            status: ActionContextStatus.empty,
            intentRequests: [],
            origin: null,
            networkParams: null,
            intentParams: null,
            requestedPubkey: null,
            selectedAccount: null,
            selectedAccountInfo: null,
            intentErrors: null,
            runtimeErrors: null,
            implicitSession: null,
            result: null,
            requestId: null
        })
    }

    setIntentError(e) {
        this.intentErrors = e
        this.setStatus(ActionContextStatus.error)
    }

    /**
     * Set current action status.
     * @param {ActionContextStatus} status
     * @param {Boolean} [resetRuntimeErrors]
     */
    setStatus(status, resetRuntimeErrors = false) {
        this.status = status
        if (resetRuntimeErrors) {
            this.runtimeErrors = null
        }
    }

    /**
     * Set selected account for the action.
     * @param {Account} account
     */
    selectAccount(account = null) {
        if (account && this.requestedPubkey && this.requestedPubkey !== account.publicKey) return
        const updated = this.selectedAccount !== account
        if (updated) {
            this.selectedAccount = account
            for (let ir of this.intentRequests)
                if (ir.txContext) {
                    ir.setTxContext(ir.txContext.tx, account)
                }
            this.loadSelectedAccountInfo()
        }
    }

    /**
     * Confirm the intent request.
     */
    async confirmRequest() {
        if (!this.selectedAccount) {
            if (this.implicitSession) {
                this.intentErrors = errors.invalidIntentRequest('Failed to restore session information')
                return this.rejectRequest()
            }
            this.runtimeErrors = errors.accountNotSelected
            return
        }

        this.setStatus(ActionContextStatus.confirmed, true)

        try {
            await processIntents(this)
            this.setStatus(ActionContextStatus.processed)

            await submitTxIntents(this)
            this.setStatus(ActionContextStatus.submitted)

            await dispatchIntentResponse(this)
            this.setStatus(ActionContextStatus.dispatched)

            navigation.navigate('/result')
            this.reset()
        } catch (e) {
            console.error(e)
            this.setIntentError(e)

            if (this.implicitSession) {
                return this.rejectRequest()
            }
        }
    }

    /**
     * Reject the request.
     * @return {Promise}
     */
    rejectRequest() {
        //if (this.status <= ActionContextStatus.empty) return Promise.resolve()
        let error
        const {intentErrors} = this
        if (intentErrors) {
            if (intentErrors.code === undefined) {
                error = errors.invalidIntentRequest(intentErrors)
            } else {
                error = intentErrors
            }
        } else {
            error = errors.actionRejectedByUser
            this.setStatus(ActionContextStatus.rejected)
        }
        return dispatchIntentError(error, this)
            .finally(() => {
                this.reset()
                setTimeout(() => window.close(), 500)
            })
    }

    /**
     * Cancel current action.
     */
    cancelAction() {
        //TODO: implement contextual action and nav path here
        navigation.navigate('/')
    }

    loadSelectedAccountInfo() {
        return loadSelectedAccountInfo(this)
            .then(info => runInAction(() => {
                this.selectedAccountInfo = info
            }))
    }
}

const actionContext = new ActionContext()

window.addEventListener('beforeunload', function () {
    if (actionContext.intent) {
        actionContext.rejectRequest()
    }
})

export default actionContext
