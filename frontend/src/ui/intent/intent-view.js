import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import IntentDescription from './intent-details-view'
import ConfirmIntentView from './confirm-intent-view'
import AuthSelectorView from '../authentication/auth-selector-view'

function parseGetParams(string) {
    return string.substr(1).split('&').reduce(function (query, part) {
        const [key, value] = part.split('=').map(v => decodeURIComponent(v))
        query[key] = value
        return query
    }, {})
}

function IntentView({location}) {
    if (!actionContext.intentProps || location.pathname !== '/confirm') return null
    if (location.pathname === '/confirm' && location.search) {
        actionContext.setContext(parseGetParams(location.search))
    }
    if (actionContext.intentErrors) {
        return <div>
            <IntentDescription expanded={true}/>
            <ConfirmIntentView/>
        </div>
    }
    if (!actionContext.confirmed) {
        return <div>
            <IntentDescription expanded={true}/>
            <ConfirmIntentView/>
        </div>
    }
    if (!actionContext.processed) {
        return <div>
            <IntentDescription expanded={false}/>
            <AuthSelectorView/>
        </div>
    }
    return <div>
        <IntentDescription expanded={false}/>
        <div className="loader"/>
    </div>
}

export default withRouter(observer(IntentView))
