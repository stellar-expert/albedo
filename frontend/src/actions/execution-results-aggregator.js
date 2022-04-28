import lastActionResult from '../state/last-action-result'

/**
 * Aggregate and compile response object from one or more executed intent requests.
 * @param {ActionContext} actionContext
 */
export function aggregateExecutionResults(actionContext) {
    const res = {}
    if (!actionContext.isBatchRequest) {
        //single intent request
        Object.assign(res, actionContext.intentRequests[0].result)
    } else {
        //multi-intents case
        Object.assign(res, actionContext.intentParams, {results: actionContext.intentRequests.map(r => r.result)})
    }
    if (actionContext.implicitSession) {
        res.executed_implicitly = true
    }
    //temporary store action result for UI
    lastActionResult.setResult(res)
    //set aggregated result
    actionContext.result = res
}