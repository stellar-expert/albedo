import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route, Redirect} from 'react-router'
import {DynamicModule} from '@stellar-expert/ui-framework'
import Layout from './layout/layout-view'
import CreateAccount from './signup/signup-view'
import AccountDashboard from './wallet/balance/account-dashboard-view'
import NotFound from './pages/not-found-view'
import Intent from './intent/intent-view'
import Login from './authentication/login-page-view'
import ImportAccount from './account/account-import-view'
import AccountSettings from './account/settings/account-settings-view'
import IntroView from './pages/intro-view'
import WebStellarLinkHandler from './intent/web-stellar-link-handler-view'
import InstallExtensionView from './pages/install-extension-view'
import TxResultView from './intent/tx/tx-result-view'
import BlockedPageView from './pages/blocked-page-view'
import CatcherView from './layout/catcher-view'

export default function AppRouter({history}) {
    return <Layout>
        <Router history={history}>
            <CatcherView>
                <Switch>
                    <Route path="/playground">
                        <DynamicModule load={() => import(/* webpackChunkName: "playground" */ './demo/demo-view')}
                                       moduleKey="playground"/></Route>
                    <Route path="/wallet">
                        <DynamicModule load={() => import(/* webpackChunkName: "wallet" */ './wallet/wallet-router')}
                                       moduleKey="wallet"/></Route>
                    <Route path="/login" component={Login}/>
                    <Route path="/import" component={ImportAccount}/>
                    <Route path="/signup" component={CreateAccount}/>
                    <Route path="/confirm" component={Intent}/>
                    <Route path="/result" component={TxResultView}/>
                    <Route path="/account" component={AccountDashboard}/>
                    <Route path="/extension" component={AccountDashboard}/>
                    <Route path="/account-settings" component={AccountSettings}/>
                    <Route path="/blocked" component={BlockedPageView}/>
                    <Route path="/install-extension" component={InstallExtensionView}/>
                    <Route path="/web-stellar-handler" component={WebStellarLinkHandler}/>
                    <Route path="/" exact component={IntroView}/>
                    <Route component={NotFound}/>
                </Switch>
            </CatcherView>
        </Router>
    </Layout>
}

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}
