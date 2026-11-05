import {Account, Keypair, TransactionBuilder} from '@stellar/stellar-sdk'
import IntentRequest from '../../src/state/intent-request'
import ActionAuthenticationContext from '../../src/actions/action-authentication-context'
import {resolveNetworkParams} from '../../src/util/network-resolver'

const defaultSecret = 'SAWR7UAO7SFBF2CLGMRLF3KRLG36HEFZHEE4G3NFJ7WRSWBIYHXWJDMQ'

/**
 * Build action context, intent request, and execution context for a given intent request data.
 * @param {{intent: String}} data - Intent name and intent params.
 * @return {Promise<{actionContext: Object, intentRequest: IntentRequest, executionContext: ActionAuthenticationContext}>}
 */
async function buildContext({intent, ...intentParams}) {
    const networkParams = resolveNetworkParams(intentParams)
    const intentRequest = new IntentRequest(intent, intentParams, networkParams)
    const actionContext = {
        intent,
        intentParams,
        networkParams,
        confidence: 'normal',
        intentRequests: [intentRequest]
    }
    //tx intent context is initialized in advance (see action-context-initializer)
    if (intent === 'tx') {
        await intentRequest.setTxContext(TransactionBuilder.fromXdr(intentParams.xdr, networkParams.network), null)
    }
    const keypair = loadKeypair()
    const executionContext = ActionAuthenticationContext.forAccount({publicKey: keypair.publicKey(), secret: keypair.secret()})
    return {actionContext, intentRequest, executionContext}
}

function loadAccount(sequence = '1', address = null) {
    return new Account(address || loadKeypair().publicKey(), sequence)
}

function loadKeypair(secret = null) {
    return Keypair.fromSecret(secret || defaultSecret)
}

export {buildContext, loadAccount, loadKeypair}
