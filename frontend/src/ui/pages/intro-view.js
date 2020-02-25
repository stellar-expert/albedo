import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'

function IntroView() {
    return <div>
        <div className="row">
            <div className="column column-50">
            </div>
            <div className="column column-50 desktop-right">
                <div className="space">
                    {!accountManager.accounts.length ?
                        <><a href="/signup">Sign up</a> or <a href="/login">log in</a></> :
                        <a href="/account">Manage your account</a>}
                </div>
            </div>
        </div>
        <p>
            Your single access point to all Stellar services.
            Safe and reliable way to use Stellar without sharing your private key.
        </p>
        <div className="space">
            <h3>Key features</h3>
            <ul style={{paddingLeft: '0'}}>
                <li>
                    <b>Secure key management</b> – your secret key is never exposed to third-party services.
                </li>
                <li>
                    <b>Secure transaction signing</b> – transactions are signed without exposing a secret key.
                </li>
                <li>
                    <b>Web apps Single Sign-On</b> – log in to third-party websites, just like Google/Facebook OAuth.
                </li>
                <li>
                    <b>Multi-account support</b> – use multiple accounts and switch them when you need it.
                </li>
                <li>
                    <b>Trustlines creation</b> – anchor trustlines and token airdrops in one click.
                </li>
                <li>
                    <b>Message signing tools</b> – sign and verify arbitrary data with your private keys.
                </li>
                <li>
                    <b><a
                        href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md">SEP-0007</a>
                        compatible</b> – can be used to handle "web+stellar" links.
                </li>
                <li>
                    <b>Works everywhere</b> – seamless experience on desktops, smartphones, and tablets.
                </li>
            </ul>
        </div>
    </div>
}

export default observer(IntroView)
