import React from 'react'
import {withRouter} from 'react-router'
import {observer} from 'mobx-react'
import actionContext, {ActionContextStatus} from '../../state/action-context'
import SoloLayoutView from '../layout/solo-layout-view'
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
        return <SoloLayoutView alignTop>
            <IntentDescription expanded={true}/>
            <IntentActionView/>
        </SoloLayoutView>
    }
    if (actionContext.status < ActionContextStatus.dispatched) {
        return <SoloLayoutView alignTop>
            <IntentDescription expanded={true}/>
            <AuthSelectorView/>
            <AccountFundingStatusView/>
            <IntentActionView/>
        </SoloLayoutView>
    }
    return <SoloLayoutView alignTop>
        <IntentDescription expanded={false}/>
        <div className="loader"/>
    </SoloLayoutView>
}

export default withRouter(observer(IntentView))
