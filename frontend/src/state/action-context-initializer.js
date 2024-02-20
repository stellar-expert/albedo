import {StrKey, TransactionBuilder} from '@stellar/stellar-base'
import {action, transaction} from 'mobx'
import {setStellarNetwork} from '@stellar-expert/ui-framework'
import {intentInterface} from '@albedo-link/intent'
import actionContext, {ActionContextStatus} from './action-context'
import accountManager from './account-manager'
import Account from './account'
import IntentRequest from './intent-request'
import {isImplicitIntentRequested} from './implicit-intent-detector'
import {restoreImplicitSession} from '../storage/implicit-session-storage'
import {resolveNetworkParams} from '../util/network-resolver'
import {aggregateIntentErrors} from './intent-errors-aggregator'

/**
 * Check validity for every recognized intent parameter.
 * @param {String} intent
 * @param {Object} intentParams
 * @return {String|null}
 */
function validateRequestParams(intent, intentParams) {
    const intentInterfaceProps = intentInterface[intent]

    if (!intentInterfaceProps)
        return `Unknown intent "${intent}".`

    const allowedParams = intentInterfaceProps.params
    for (let param in allowedParams)
        if (allowedParams.hasOwnProperty(param)) {
            const descriptor = allowedParams[param],
                value = intentParams[param]
            if (descriptor.required && !value)
                return `Parameter "${param}" is required.`
        }
    return null
}

/**
 * Parse atomic intent request.
 * @param {String} intent
 * @param {Object} intentParams
 * @param {StellarNetworkParams} networkParams
 * @param {Object} actionContextParams
 * @return {Promise<IntentRequest>}
 */
async function parseIntentRequest(intent, intentParams, networkParams, actionContextParams) {
    const intentRequest = new IntentRequest(intent, intentParams)

    function reject(error) {
        intentRequest.intentErrors = error
        return intentRequest
    }

    const validationResult = validateRequestParams(intent, intentParams)
    if (validationResult) return reject(validationResult)

    //initialize transaction context in advance for the tx intent
    if (intent === 'tx') {
        try {
            const tx = TransactionBuilder.fromXDR(intentParams.xdr, networkParams.network)
            await intentRequest.setTxContext(tx, actionContextParams.selectedAccount)
        } catch (e) {
            return reject(`Invalid transaction XDR`)
        }
    }

    //validate implicit flow request preconditions
    if (intent === 'implicit_flow') {
        let {intents = []} = intentParams
        /*if (app_origin !== window.origin) { //this check is not needed without the implicit mode whitelist
            return reject( `Origin "${app_origin}" is not allowed to request implicit flow permissions.`)
        }*/
        if (typeof intents === 'string') {
            intents = intents.split(',')
        }
        if (!(intents instanceof Array) || !intents.length)
            return reject(`No intents were specified for the implicit mode.`)

        intentParams.intents = intents
        //check that intent exists and is allowed in the implicit mode
        for (let requestedIntent of intents) {
            const descriptor = intentInterface[requestedIntent]
            if (!descriptor)
                return reject(`Unknown intent requested: "${requestedIntent}".`)

            if (!descriptor.implicitFlow)
                return reject(`Intent ${requestedIntent} can't be used in the implicit flow.`)
        }
    }

    if (intent === 'manage_account') {
        const {pubkey} = intentParams
        const acc = accountManager.get(pubkey)
        if (!acc)
            return reject(`Unknown account requested: "${pubkey}".`)
        await accountManager.setActiveAccount(acc)
        if (intentParams.network) {
            //TODO: consider setting the network temporary, without overriding the last selected network
            setStellarNetwork(networkParams.networkName)
        }
    }

    return intentRequest
}

/**
 * Parse and validate multiple batched transaction intent requests.
 * @param {Object[]} intents
 * @param {StellarNetworkParams} networkParams
 * @param {Object} actionContextParams
 * @return {Promise<IntentRequest>[]|String}
 */
function extractBatchedIntents(intents, networkParams, actionContextParams) {
    if (!intents) return 'Parameter "intents" is required.'
    if (intents.length < 1) return 'Batch intent request should contain at least one intent request.'
    if (intents.length > 20) return 'Too many batched intents requested.'
    if (intents.some(nested => nested.intent !== 'tx')) return 'Only "tx" intent is allowed in batch intent requests.'
    return intents.map(({intent, ...intentParams}) => parseIntentRequest(intent, intentParams, networkParams, actionContextParams))
}

/**
 * Set current context based on the request params.
 * @param {Object} params - Intent request parameters received from a caller app.
 * @return {Promise<ActionContext>}
 */
export async function setActionContext(params) {
    function reject(error) {
        actionContext.setIntentError(error)
        return actionContext.rejectRequest()
    }

    try {
        //first reset context properties
        actionContext.reset()
        //retrieve known parameters
        const {intent, app_origin, wallet_redirect, __albedo_intent_version, __reqid, ...intentParams} = params
        //resolve caller app origin
        actionContext.origin = (app_origin || '').toLowerCase().replace(/https?:\/\//, '')
        actionContext.requestId = __reqid
        if (wallet_redirect) {
            actionContext.walletRedirect = wallet_redirect
        }
        //resolve Stellar network properties for provided intent parameters
        const networkParams = resolveNetworkParams(intentParams)

        const actionContextParams = {
            status: ActionContextStatus.pending,
            selectedAccount: accountManager.activeAccount,
            networkParams
        }

        //intent should be present
        if (!intent)
            return reject('Parameter "intent" is required.')

        //validate requested public key if provided by a caller
        if (intentParams.pubkey) {
            if (!StrKey.isValidEd25519PublicKey(intentParams.pubkey))
                return reject('Invalid "pubkey" parameter. Stellar account public key expected.')
            actionContextParams.requestedPubkey = intentParams.pubkey
            //set requested account as selected if it matches stored account
            actionContextParams.selectedAccount = accountManager.get(intentParams.pubkey)
        }

        //set basic intent params for further references
        actionContextParams.intentParams = {intent, ...intentParams}

        //parse and validate provided intent request
        const isBatchRequest = intent === 'batch'
        let requests
        if (isBatchRequest) {
            requests = extractBatchedIntents(intentParams.intents, networkParams, actionContextParams)
            if (typeof requests === 'string') return reject(requests)
        } else {
            requests = [parseIntentRequest(intent, intentParams, networkParams, actionContextParams)]
        }

        //set nested intent requests
        actionContextParams.intentRequests = await Promise.all(requests)

        //check for errors within nested params
        const intentErrors = aggregateIntentErrors(actionContextParams.intentRequests.map(r => r.intentErrors), isBatchRequest)
        if (intentErrors)
            return reject(intentErrors)

        //check whether we deal with an implicit intent
        if (isImplicitIntentRequested({intent, ...intentParams})) {
            //try to find corresponding session
            actionContextParams.implicitSession = await restoreImplicitSession(intentParams.session)
        }

        //update action context parameters
        transaction(() => Object.assign(actionContext, actionContextParams))

        if (actionContext.implicitSession) {
            actionContext.selectAccount(Account.ephemeral(actionContext.implicitSession.secret))
        }

        return actionContext
    } catch (e) {
        return reject(e)
    }
}