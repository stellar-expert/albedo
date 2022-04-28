import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {observer} from 'mobx-react'
import actionContext, {ActionContextStatus} from '../../state/action-context'
import IntentDescription from './intent-details-view'
import IntentActionView from './intent-action-view'
import AuthSelectorView from '../authentication/auth-selector-view'
import AccountFundingStatusView from '../account/account-funding-status-view'

function IntentView({location}) {
    if (actionContext.status === ActionContextStatus.empty || location.pathname !== '/confirm') return null
    /*if (location.pathname === '/confirm' && location.search) {
        setActionContext(parseGetParams(location.search))
    }*/
    if (actionContext.intentErrors) {
        return <div>
            <IntentDescription expanded={true}/>
            <IntentActionView/>
        </div>
    }
    if (actionContext.status < ActionContextStatus.dispatched) {
        return <div>
            <IntentDescription expanded={true}/>
            <AuthSelectorView/>
            <AccountFundingStatusView/>
            <IntentActionView/>
        </div>
    }
    return <div>
        <IntentDescription expanded={false}/>
        <div className="loader"/>
    </div>
}

export default withRouter(observer(IntentView))
