import {intentInterface} from 'albedo-intent'

/**
 * Check whether an implicit mode requested for a given intent request.
 * @param {Object} params
 * @return {boolean}
 */
export function isImplicitIntentRequested(params) {
    const {intent, ...intentParams} = params
    //the intent param should be set
    if (!intent) return false
    const {pubkey, session} = intentParams
    //we allow implicit action only if pubkey and session key are provided
    if (!pubkey || !session) return false
    //check that implicit flow is available for current intent
    const intentDescriptor = intentInterface[intent]
    if (!intentDescriptor.implicitFlow) return false
    //prerequisites matched
    return true
}