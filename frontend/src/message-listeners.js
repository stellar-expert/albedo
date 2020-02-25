import {version} from '../package'
import actionContext from './state/action-context'

function registerMessageListeners(window) {
    (window.opener || window.parent).postMessage({albedo: {version}}, '*')

    window.addEventListener('message', function ({data, origin, source}) {
        if (!data.intent) return
        actionContext.setContext(Object.assign({}, data, {app_origin: origin}))
            .then(() => {
                if (actionContext.isInsideFrame) {
                    if (!actionContext.isImplicitIntent) {
                        return actionContext.rejectRequest(new Error(`Attempt to execute an invalid implicit intent in the iframe mode`))
                    }
                    actionContext.confirmRequest()
                        .then(() => {
                            if (actionContext.response) {
                                actionContext.finalize()
                            }
                        })
                        .catch(e => actionContext.rejectRequest(e))
                } else {
                    window.__history.push('/confirm')
                }
            })
    })
}

export {registerMessageListeners}
