import {version} from '../../package'
import actionContext from '../state/action-context'
import {isInsideFrame} from './frame-utils'

function registerMessageListeners(window) {
    (window.opener || window.parent).postMessage({albedo: {version}}, '*')

    window.addEventListener('message', function ({data = {}, origin, source}) {
        //synchronize localStorage inside iframe if requested during implicit request confirmation
        if (data.sync && isInsideFrame() && origin === window.origin) {
            for (let key of Object.keys(data.sync)) {
                localStorage.setItem(key, data.sync[key])
            }
        }
        //TODO: we can store source in the actionContext to avoid possible source window disambiguation
        if (!data.__albedo_intent_version || !data.intent) return
        data.app_origin = origin || null
        actionContext.setContext(data)
            .then(() => {
                if (!isInsideFrame()) {
                    //interactive flow
                    window.__history.push('/confirm')
                    return
                }
                //check implicit flow prerequisites
                if (!actionContext.isImplicitIntent)
                    return actionContext.rejectRequest(new Error(`Attempt to execute an invalid implicit intent in the iframe mode`))
                //implicit flow
                actionContext.confirmRequest()
                    .then(() => {
                        if (actionContext.response) {
                            actionContext.finalize()
                        }
                    })
                    .catch(e => actionContext.rejectRequest(e))
            })
    })
}

export {registerMessageListeners}
