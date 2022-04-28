import {handleTxError} from './tx-error-handler'
import {aggregateExecutionResults} from './execution-results-aggregator'
import errors from '../util/errors'

/**
 * Submit a signed transaction from intent to Horizon
 * @param {ActionContext} actionContext
 * @return {Promise<Object>}
 */
export async function submitTxIntents(actionContext) {
    //process all intent requests
    const submitPromises = actionContext.intentRequests
        .map(ir => {
            //skip further processing for intents that shouldn't be submitted to Horizon
            if (!ir.txContext || !ir.autoSubmitToHorizon) return Promise.resolve(null)
            //submit transaction
            return actionContext.networkParams.createHorizon()
                .submitTransaction(ir.txContext.tx) //submit tx
                .catch(err => handleTxError(err, actionContext))
        })
    //wait for all of them to be executed (or fail)
    const results = await Promise.allSettled(submitPromises)
    //process execution results
    let failed = false
    for (let i = 0; i < results.length; i++) {
        const pr = results[i]
        let horizonResult
        if (pr.status === 'rejected') { //failed
            failed = true
            horizonResult = errors.prepareErrorDescription(pr.reason)
        } else { //succeeded
            if (!pr.value) continue
            horizonResult = pr.value
        }
        //set individual tx execution result
        actionContext.intentRequests[i].result.horizonResult = horizonResult
    }
    //compile execution result
    aggregateExecutionResults(actionContext)
    //the entire request is considered failed if at least one of transactions failed for some reason
    if (failed)
        throw errors.horizonError(`Failed to submit ${results.length > 1 ? 'one of the transactions' : 'transaction'}`)
}