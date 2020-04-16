import {version} from '../../package'
import actionContext from '../state/action-context'
import {isInsideExtension} from './extension-utils'

function registerMessageListeners(window) {
    (window.opener || window.parent).postMessage({albedo: {version}}, '*')

    window.addEventListener('message', function ({data, origin, source}) {
        //TODO: we can store source in the actionContext to avoid possible source window disambiguation
        if (!data.intent) return
        //trust app_origin only inside extension, otherwise it's unsafe and have to be updated with origin received form the event itself
        if (!isInsideExtension()) {
            data.app_origin = origin
        }
        actionContext.setContext(data)
            .then(() => {
                if (!actionContext.isInsideFrame) {
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
