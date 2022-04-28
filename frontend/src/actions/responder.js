import registerSigningActions from './signing-actions'
import registerTxActions from './tx-actions'
import registerManagementActions from './management-actions'
import accountManager from '../state/account-manager'
import Account, {ACCOUNT_TYPES} from '../state/account'
import authorizationService from '../state/auth/authorization'
import ActionAuthenticationContext from './action-authentication-context'
import {resolveNetworkParams} from '../util/network-resolver'
import {aggregateIntentErrors} from '../state/intent-errors-aggregator'

//actions registry
const reactions = {}

/**
 * Register action reaction callback.
 * @param {String} intent - Intent name.
 * @param {function({actionContext: ActionContext, intentRequest: IntentRequest, executionContext: ActionAuthenticationContext})} reaction
 */
function registerReaction(intent, reaction) {
    if (!intent)
        throw new Error('Invalid intent.')
    if (typeof reaction !== 'function')
        throw new Error('Invalid intent reaction.')
    if (reactions[intent])
        throw new Error(`A reaction for intent "${intent}" has been already registered.`)
    reactions[intent] = reaction
}

//register all supported intent actions
registerSigningActions(registerReaction)
registerTxActions(registerReaction)
registerManagementActions(registerReaction)

/**
 * Process confirmed intent and return execution result.
 * @param {ActionContext} actionContext - Current action context.
 * @return {Promise}
 */
export async function processIntents(actionContext) {
    //init actions wrapper
    let executionContext
    if (actionContext.implicitSession) {
        executionContext = getImplicitIntentExecutionContext(actionContext)
    } else {
        executionContext = await getInteractiveExecutionContext(actionContext)
    }

    const results = await Promise.allSettled(actionContext.intentRequests.map(async intentRequest => {
        const {intent, intentParams} = intentRequest,
            action = reactions[intent]

        if (!action)
            throw new Error(`Unknown intent "${intent}".`)
        //execute action
        const intentResult = await action({
            actionContext,
            intentRequest,
            executionContext
        })
        //add request params
        intentRequest.result = Object.assign({intent}, intentParams, intentResult)
    }))

    //check for errors
    const intentRequestErrors = results.map(res => res.status === 'rejected' ? res.reason : undefined)
    const errors = aggregateIntentErrors(intentRequestErrors, actionContext.isBatchRequest)
    if (errors) {
        actionContext.setIntentError(errors)
        return await actionContext.rejectRequest()
    }
}

/**
 * Generate execution context for an implicit call
 * @param actionContext
 * @return {ActionAuthenticationContext}
 */
function getImplicitIntentExecutionContext(actionContext) {
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
    if (secret)
        return ActionAuthenticationContext.forAccount(Account.ephemeral(secret))
    //for HW accounts, load an account from the localStorage
    if (accountType === ACCOUNT_TYPES.TREZOR_ACCOUNT || accountType === ACCOUNT_TYPES.LEDGER_ACCOUNT) {
        //TODO: retrieve an account by id and find a keypair by publicKey
        const account = accountManager.get(publicKey)
        return ActionAuthenticationContext.forAccount(account)
    }
    throw new Error(`Implicit sessions are not supported for account type ${accountType}.`)
}

/**
 * Generate execution context for an interactive session.
 * @return {Promise<ActionAuthenticationContext>}
 */
async function getInteractiveExecutionContext(actionContext) {
    const {selectedAccount} = actionContext
    if (!selectedAccount)
        throw new Error(`Account not selected.`)
    //Albedo account
    const executionContext = ActionAuthenticationContext.forAccount(selectedAccount)
    if (selectedAccount.isStoredAccount) {
        executionContext.credentials = await authorizationService.requestAuthorization(selectedAccount)
    }
    return executionContext
}
