import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route, Redirect} from 'react-router'
import {DynamicModule} from '@stellar-expert/ui-framework'
import CatcherView from './layout/catcher-view'
import Layout from './layout/layout-view'
import Intent from './intent/intent-view'
import TxResultView from './intent/tx/tx-result-view'
import WebStellarLinkHandler from './intent/web-stellar-link-handler-view'
import AccountDashboard from './wallet/balance/account-dashboard-view'
import CreateAccount from './signup/signup-view'
import Login from './authentication/login-page-view'
import ImportAccount from './account/account-import-view'
import AccountSettings from './account/settings/account-settings-view'
import AccountAddressBook from './account/address-book/account-address-book-view'
import IntroView from './pages/intro-view'
import InstallExtensionView from './pages/install-extension-view'
import BlockedPageView from './pages/blocked-page-view'
import NotFound from './pages/not-found-view'

export default function AppRouter({history}) {
    return <Router history={history}>
        <CatcherView>
            <Switch>
                <Route path="/playground">
                    <DynamicModule load={() => import(/* webpackChunkName: "playground" */ './demo/demo-view')}
                                   moduleKey="playground"/></Route>
                <Route>
                    <Layout>
                        <Switch>
                            <Route path="/wallet">
                                <DynamicModule load={() => import(/* webpackChunkName: "wallet" */ './wallet/wallet-router')}
                                               moduleKey="wallet"/></Route>
                            <Route path="/wallet-connect">
                                <DynamicModule load={() => import(/* webpackChunkName: "wallet-connect" */ './wallet-connect/wc-router')}
                                               moduleKey="wallet-connect"/></Route>
                            <Route path="/login" component={Login}/>
                            <Route path="/import" component={ImportAccount}/>
                            <Route path="/signup" component={CreateAccount}/>
                            <Route path="/confirm" component={Intent}/>
                            <Route path="/result" component={TxResultView}/>
                            <Route path="/account-settings" component={AccountSettings}/>
                            <Route path="/addressbook" component={AccountAddressBook}/>
                            <Route path="/blocked" component={BlockedPageView}/>
                            <Route path="/install-extension" component={InstallExtensionView}/>
                            <Route path="/web-stellar-handler" component={WebStellarLinkHandler}/>
                            <Route path="/intro" component={IntroView}/>
                            <Route path="/extension" component={AccountDashboard}/>
                            <Route path="/" exact component={AccountDashboard}/>
                            <Redirect from="/account" to="/"/>
                            <Route component={NotFound}/>
                        </Switch>
                    </Layout>
                </Route>
            </Switch>
        </CatcherView>
    </Router>
}

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}
