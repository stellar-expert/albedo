import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route} from 'react-router'
import Layout from './layout/layout-view'
import CreateAccount from './authentication/signup-view'
import AccountSettings from './account-settings/account-settings-view'
import AddKeypair from './keypair/add-keypair-view'
import Intro from './pages/intro-view'
import NotFound from './pages/not-found-view'
import Intent from './intent/intent-view'
import loadable from './components/loadable'
import Login from './authentication/login-page-view'

function AppRouter({history}) {
    return <Layout>
        <Router history={history}>
            <Switch>
                <Route path="/demo"
                       component={loadable(() => import(/* webpackChunkName: "demo" */ './demo/demo-view'))}/>
                <Route path="/button-generator"
                       component={loadable(() => import(/* webpackChunkName: "buttonGenerator" */ './button-generator/button-generator-view'))}/>
                <Route>
                    <div className="container">
                        <Switch>
                            <Route path="/login" component={Login}/>
                            <Route path="/signup" component={CreateAccount}/>
                            <Route path="/confirm" component={Intent}/>
                            <Route path="/account/add-keypair" component={AddKeypair}/>
                            <Route path="/account" component={AccountSettings}/>
                            <Route path="/" exact component={Intro}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </div>
                </Route>
            </Switch>
        </Router>
    </Layout>
}

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}

export default AppRouter
