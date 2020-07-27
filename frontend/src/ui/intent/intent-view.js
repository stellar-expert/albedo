import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import IntentDescription from './intent-details-view'
import ConfirmIntentView from './confirm-intent-view'
import AuthSelectorView from '../authentication/auth-selector-view'
import AccountFundingStatusView from '../account/account-funding-status-view'

function IntentView({location}) {
    if (!actionContext.intentProps || location.pathname !== '/confirm') return null
    /*if (location.pathname === '/confirm' && location.search) {
        actionContext.setContext(parseGetParams(location.search))
    }*/
    if (actionContext.intentErrors) {
        return <div>
            <IntentDescription expanded={true}/>
            <ConfirmIntentView/>
        </div>
    }
    if (!actionContext.processed) {
        return <div>
            <IntentDescription expanded={true}/>
            <AuthSelectorView/>
            <AccountFundingStatusView/>
            <ConfirmIntentView/>
        </div>
    }
    return <div>
        <IntentDescription expanded={false}/>
        <div className="loader"/>
    </div>
}

export default withRouter(observer(IntentView))
