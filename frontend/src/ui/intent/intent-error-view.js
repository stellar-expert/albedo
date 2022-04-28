import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'

function IntentErrorView() {
    //TODO: use only unified error objects everywhere in intentErrors to prevent problems with type casting
    const err = actionContext.intentErrors || actionContext.runtimeErrors
    if (!err) return null
    const text = err.message || err

    return <div>
        <h2 style={{marginTop: '0.3em'}} className="color-danger">Error</h2>
        <hr className="flare"/>
        <div className="error text-small">
            <i className="icon-warning"/> {text}
            {(!err.code || err.code === -1) && <div className="micro-space">
                It's likely an external application error. Please contact support team of {actionContext.origin}
            </div>}
        </div>
    </div>
}

export default observer(IntentErrorView)