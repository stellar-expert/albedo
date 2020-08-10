import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route, Redirect} from 'react-router'
import Layout from './layout/layout-view'
import CreateAccount from './signup/signup-view'
import AccountDashboard from './dashboard/account-dashboard-view'
import NotFound from './pages/not-found-view'
import Intent from './intent/intent-view'
import loadable from './components/loadable'
import Login from './authentication/login-page-view'
import ImportAccount from './account/account-import-view'
import AccountSettings from './account/settings/account-settings-view'
import IntroView from './pages/intro-view'
import WebStellarLinkHandler from './intent/web-stellar-link-handler-view'
import InstallExtensionView from './pages/install-extension-view'

function AppRouter({history}) {
    return <Layout>
        <Router history={history}>
            <Switch>
                <Redirect from="/demo" to="/playground"/>
                <Route path="/playground"
                       component={loadable(() => import(/* webpackChunkName: "demo" */ './demo/demo-view'))}/>
                <Route path="/login" component={Login}/>
                <Route path="/import" component={ImportAccount}/>
                <Route path="/signup" component={CreateAccount}/>
                <Route path="/confirm" component={Intent}/>
                <Route path="/account" component={AccountDashboard}/>
                <Route path="/extension" component={AccountDashboard}/>
                <Route path="/account-settings" component={AccountSettings}/>
                <Route path="/install-extension" component={InstallExtensionView}/>
                <Route path="/web-stellar-handler" component={WebStellarLinkHandler}/>
                <Route path="/" exact component={IntroView}/>
                <Route component={NotFound}/>
            </Switch>
        </Router>
    </Layout>
}

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}

export default AppRouter
