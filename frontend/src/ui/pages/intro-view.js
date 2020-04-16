import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import './intro.scss'
import {registerProtocolHandler} from '../../util/protocol-handler'

function FeatureBlockView({title, children}) {
    return <div className="feature-block column column-50">
        <h2>{title}</h2>
        <div className="space text-small">
            {children}
        </div>
    </div>
}

function IntroView() {
    const loggedIn = !!accountManager.accounts.length
    return <div>
        <div className="row mobile-only"/>
        <h2 className="mobile-center">
            Single access point to all Stellar apps
        </h2>
        {loggedIn && <div className="text-right text-small">
            <a href="/account"><i className="fa fa-cog" style={{fontSize: '0.9em'}}/> Account settings</a>
        </div>}
        <div className="double-space text-center intro-cta">
            <span>
            <a className="button button-outline" href="/signup">Create new Albedo
                account</a>
            </span>
            <span className="v-slash"><span>or</span></span>
            <span>
            <a className="button button-outline" href="/login">Log in to
                existing account</a>
            </span>
        </div>
        <div className="double-space row">
            <FeatureBlockView title="Secure key management">Your secret key is never exposed to third-party
                services</FeatureBlockView>
            <FeatureBlockView title="Secure transaction signing">Transactions are signed without exposing a secret
                key</FeatureBlockView>
            <FeatureBlockView title="Web apps Single Sign-On">Log in to third-party websites, just like Google/Facebook
                OAuth</FeatureBlockView>
            <FeatureBlockView title="Multi-account support">Use multiple accounts and switch them when you need
                it</FeatureBlockView>
            <FeatureBlockView title="Trustlines creation">Anchor trustlines and token airdrops in one
                click</FeatureBlockView>
            <FeatureBlockView title="Message signing tools">Sign and verify arbitrary data with your private
                keys</FeatureBlockView>
            <FeatureBlockView title="Works everywhere">Seamless experience on desktops, smartphones, and
                tablets</FeatureBlockView>
            <FeatureBlockView title="SEP-0007 compatible">Can be used to handle "web+stellar" links</FeatureBlockView>
        </div>
        <div className="double-space"/>
        <div className="row">
            <div className="column column-50 column-offset-25">
                <a href="/demo" target="_blank" className="button button-outline button-block">Check demos</a>
                <a href="/" target="_blank" className="button button-outline button-block">Get Chrome extension</a>
                <a href="#" onClick={() => registerProtocolHandler()} className="button button-outline button-block">Install
                    as web+stellar handler</a>
            </div>
        </div>
    </div>
}

export default observer(IntroView)
