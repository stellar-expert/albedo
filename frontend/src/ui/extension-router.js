import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route} from 'react-router'
import CreateAccount from './authentication/signup-view'
import AccountSettings from './account-settings/account-settings-view'
import AddKeypair from './keypair/add-keypair-view'
import Dashboard from './pages/dashboard-view'
import NotFound from './pages/not-found-view'
import Intent from './intent/intent-view'
import Login from './authentication/login-page-view'
import LayoutView from './layout/layout-view'

function ExtensionRouter({history}) {
    return <LayoutView>
        <Router history={history}>
            <Switch>
                <Route path="/login" component={Login}/>
                <Route path="/signup" component={CreateAccount}/>
                <Route path="/confirm" component={Intent}/>
                <Route path="/account/add-keypair" component={AddKeypair}/>
                <Route path="/account" component={AccountSettings}/>
                <Route path="/" exact component={Dashboard}/>
                <Route component={NotFound}/>
            </Switch>
        </Router>
    </LayoutView>
}

ExtensionRouter.propTypes = {
    history: PropTypes.object.isRequired
}

export default ExtensionRouter
