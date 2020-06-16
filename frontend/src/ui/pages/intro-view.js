import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import {registerProtocolHandler} from '../../util/protocol-handler'
import './intro.scss'
import {isInsideFrame} from '../../util/frame-utils'

function Feature({title, children}) {
    return <div className="feature-block column column-50">
        <h2>{title}</h2>
        <div className="space text-small">{children}</div>
    </div>
}

function IntroView() {
    const loggedIn = !!accountManager.accounts.length
    return <div className="double-space">
        <h2 className="text-center">Single access point to Stellar universe</h2>
        {loggedIn && <div className="text-right text-small">
            <a href="/account"><i className="fa fa-cog" style={{fontSize: '0.9em'}}/> Account settings</a>
        </div>}
        <div className="double-space text-center">
            <a className="button button-outline" href="/signup">Create Albedo account</a>
        </div>
        <div className="double-space row wide">
            <Feature title="Secure key management">Your secret key is never exposed to third-party services</Feature>
            <Feature title="Secure transaction signing">Transactions are signed without exposing a secret key</Feature>
            <Feature title="Web apps Single Sign-On">Log in to third-party websites, just like Google/Facebook
                OAuth</Feature>
            <Feature title="Multi-account support">Use multiple accounts and switch them when you need it</Feature>
            <Feature title="Trustlines creation">Anchor trustlines and token airdrops in one click</Feature>
            <Feature title="Message signing tools">Sign and verify arbitrary data with your private keys</Feature>
            <Feature title="Works everywhere">Seamless experience on desktops, smartphones, and tablets</Feature>
            <Feature title="SEP-0007 compatible">Can be used to handle "web+stellar" links</Feature>
        </div>
        <div className="double-space"/>
        <div>
            <a href="/playground" target="_blank" className="button button-outline button-block">
                Developer playground
            </a>
            {!isInsideFrame() && <>
                <a href="/install-extension" className="button button-outline button-block">Get browser extension</a>
                <a href="#" onClick={() => registerProtocolHandler()}
                   className="button button-outline button-block">Install as web+stellar handler</a>
            </>}
        </div>
    </div>
}

export default observer(IntroView)
