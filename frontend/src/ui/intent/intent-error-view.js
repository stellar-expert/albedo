import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'

function IntentErrorView() {
    //TODO: use only unified error objects everywhere in intentErrors to prevent problems with type casting
    let text
    const err = actionContext.intentErrors || actionContext.runtimeErrors
    if (err) {
        text = 'Error: ' + err.message || err
        if (!err.code || err.code === -1) {
            text += ` It's likely an external application error. Please contact support team of ${actionContext.origin}.`
        }
    }

    if (text) return <div className="error text-small"><i className="icon-warning"/> {text}</div>
    return null
}

export default observer(IntentErrorView)