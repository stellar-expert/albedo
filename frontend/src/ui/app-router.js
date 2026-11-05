import React from 'react'
import {RouterSwitch, Router, Route, Redirect, DynamicModule} from '@stellar-expert/ui-framework'
import CatcherView from './layout/catcher-view'
import Layout from './layout/layout-view'
import WideLayout from './layout/wide-layout-view'
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
import BlockedPageView from './pages/blocked-page-view'
import NotFound from './pages/not-found-view'

export default function AppRouter() {
    return <Router>
        <CatcherView>
            <RouterSwitch>
                <Route path="/playground">
                    <DynamicModule load={() => import(/* webpackChunkName: "playground" */ './demo/demo-view')}
                                   moduleKey="playground"/></Route>
                <Route path="/intro">
                    <WideLayout>
                        <IntroView/>
                    </WideLayout>
                </Route>
                <Route>
                    <Layout>
                        <RouterSwitch>
                            <Route path="/wallet">
                                <DynamicModule load={() => import(/* webpackChunkName: "wallet" */ './wallet/wallet-router')}
                                               moduleKey="wallet"/></Route>
                            <Route path="/login" component={Login}/>
                            <Route path="/import" component={ImportAccount}/>
                            <Route path="/signup" component={CreateAccount}/>
                            <Route path="/confirm" component={Intent}/>
                            <Route path="/result" component={TxResultView}/>
                            <Route path="/account-settings" component={AccountSettings}/>
                            <Route path="/addressbook" component={AccountAddressBook}/>
                            <Route path="/blocked" component={BlockedPageView}/>
                            <Route path="/web-stellar-handler" component={WebStellarLinkHandler}/>
                            <Route path="/extension" component={AccountDashboard}/>
                            <Route path="/" exact component={AccountDashboard}/>
                            <Redirect from="/account" to="/"/>
                            <Route component={NotFound}/>
                        </RouterSwitch>
                    </Layout>
                </Route>
            </RouterSwitch>
        </CatcherView>
    </Router>
}
