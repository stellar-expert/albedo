import registerSigningActions from './signing-actions'
import registerTxActions from './tx-actions'
import registerManagementActions from './management-actions'
import accountManager from '../state/account-manager'
import {ACCOUNT_TYPES} from '../state/account'
import authorizationService from '../state/auth/authorization'
import {restoreImplicitSession} from '../storage/implicit-session-storage'
import ActionExecutionContext from './action-execution-context'
import {resolveNetworkParams} from '../util/network-resolver'

/**
 * The responder responsible for a confirmed action execution and finalization.
 */
class Responder {
    constructor() {
        //actions registry
        this.reactions = {}
        //register all supported intent actions
        registerSigningActions(this)
        registerTxActions(this)
        registerManagementActions(this)
    }

    /**
     * Register action reaction callback.
     * @param {String} intent - Intent name.
     * @param {function({actionContext: ActionContext, executionContext: ActionExecutionContext})} reaction
     */
    registerReaction(intent, reaction) {
        if (!intent) throw new Error('Invalid intent.')
        if (typeof reaction !== 'function') throw new Error('Invalid intent reaction.')
        if (this.reactions[intent]) throw new Error(`A reaction for intent "${intent}" has been registered already.`)
        this.reactions[intent] = reaction
    }

    /**
     * Process response.
     * @param {ActionContext} actionContext - Current intent context.
     * @return {Promise<object>}
     */
    async process(actionContext) {
        const {intent, intentParams} = actionContext,
            action = this.reactions[intent]

        if (!action)
            throw new Error(`Unknown intent "${intent}".`)
        //init actions wrapper
        let executionContext
        if (actionContext.secret) {
            executionContext = this.getDirectKeyInputExecutionContext(actionContext)
        } else if (actionContext.isImplicitIntent) {
            executionContext = this.getImplicitIntentExecutionContext(actionContext)
        } else {
            executionContext = await this.getInteractiveExecutionContext()
        }

        //execute action
        const res = await action({
            actionContext,
            executionContext
        })
        if (!res) return null
        if (actionContext.isImplicitIntent) {
            res.executed_implicitly = true
        }
        //add extra fields to the response
        return  Object.assign({intent: actionContext.intent}, intentParams, res)
    }

    getDirectKeyInputExecutionContext(actionContext) {
        const {secret} = actionContext
        actionContext.secret = null
        return ActionExecutionContext.forSecret(secret)
    }

    getImplicitIntentExecutionContext(actionContext) {
        const {intent, intentParams} = actionContext,
            session = actionContext.implicitSession
        let {network: requestedNetwork} = resolveNetworkParams(intentParams)
        //TODO: request interactive session if the request can't be confirmed in implicit mode
        if (!session)
            throw new Error(`Session doesn't exist or expired`)
        const {accountType, publicKey, secret, intents, network} = session,
            {network: enforcedNetwork} = resolveNetworkParams({network})
        //session should allow the intent
        if (!intents.includes(intent))
            throw new Error(`Intent ${intent} is not allowed for this implicit session.`)
        //session should allow the intent
        if (requestedNetwork !== enforcedNetwork) {
            //ignore network check for unrelated intents
            if (!['sign_message', 'public_key'].includes(intent))
                throw new Error(`Network "${network}" is not allowed for this implicit session.`)
        }
        //initiate wrapper if the session contains a secret key
        if (secret) return ActionExecutionContext.forSecret(secret)
        //for HW accounts, load an account from the localStorage
        if (accountType === ACCOUNT_TYPES.TREZOR_ACCOUNT || accountType === ACCOUNT_TYPES.LEDGER_ACCOUNT) {
            //TODO: retrieve an account by id and find a keypair by publicKey
            const account = accountManager.get(publicKey)
            return ActionExecutionContext.forAccount(account)
        }
        throw new Error(`Implicit sessions are not supported for account type ${accountType}.`)
    }

    async getInteractiveExecutionContext() {
        const {activeAccount} = accountManager
        if (!activeAccount)
            throw new Error(`Account was not selected.`)
        const executionContext = ActionExecutionContext.forAccount(activeAccount)
        if (activeAccount.isStoredAccount) {
            executionContext.credentials = await authorizationService.requestAuthorization(activeAccount)
        }
        return executionContext
    }
}

const responder = new Responder()

export default responder
