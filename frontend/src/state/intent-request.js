import {action, computed, makeObservable, observable, runInAction} from 'mobx'
import TxContext from './tx-context'
import accountManager from './account-manager'

export default class IntentRequest {
    constructor(intent, intentParams) {
        this.intent = intent
        this.intentParams = intentParams
        makeObservable(this, {
            intent: observable,
            intentParams: observable.shallow,
            txContext: observable,
            intentErrors: observable,
            requiresExistingAlbedoAccount: computed,
            autoSubmitToHorizon: computed,
            setTxContext: action
        })
    }

    /**
     * Requested intent.
     * @type {String}
     */
    intent = null

    /**
     * Request params.
     * @type {Object}
     */
    intentParams = null

    /**
     * Requested transaction context.
     * @type {TxContext}
     */
    txContext = null

    /**
     * Errors found during intent validation or execution.
     * @type {String}
     */
    intentErrors = null

    /**
     * Response generated during intent execution.
     * @type {Object}
     */
    result = null

    get requiresExistingAlbedoAccount() {
        return this.intent === 'public_key' && this.intentParams.require_existing
    }

    get autoSubmitToHorizon() {
        return this.intentParams?.submit || false
    }

    /**
     * Prepare and set TxContext for supported intents.
     * @param {Transaction} transaction
     * @param {Account} account
     * @return {Promise<TxContext>}
     */
    async setTxContext(transaction, account) {
        //set tx context, retrieve network params from intent params
        const txContext = new TxContext(transaction, this.intentParams)
        //discover available signers using current account
        const availableSigners = !account ? [] : [account.publicKey]
        txContext.setAvailableSigners(availableSigners)
        try {
            await txContext.updateSignatureSchema()
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.txContext = txContext
        })
        return txContext
    }
}