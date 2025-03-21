import React from 'react'
import {CodeBlock} from '@stellar-expert/ui-framework'

function DemoIntroView() {
    return <>
        <p className="space">
            <b>Albedo</b> provides a safe and reliable way to use Stellar accounts without trusting anyone
            with secret keys. It is a useful tool for delegated transactions signing, third-party websites log-in,
            arbitrary message signing, and much more. Albedo allows users to securely store their secret keys in
            encrypted accounts, use hardware wallets for transaction/message signing, or convenient interface for
            directly provided secret keys.
        </p>
        <h3>Key features</h3>
        <ul>
            <li>
                <b>Secure key management</b> – your secret key is never exposed to third-party services.
            </li>
            <li>
                <b>Secure transaction signing</b> – transactions are signed without exposing a secret key.
            </li>
            <li>
                <b>Web apps Single Sign-On</b> – log in to third-party websites, just like with Google or
                Facebook OAuth.
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
                <b>Works everywhere</b> – seamless experience on desktops, smartphones, and tablets.
            </li>
        </ul>
        <hr className="flare"/>
        <div>
            <h2>Setup</h2>
            <div>
                <CodeBlock lang="js">{`import albedo from '@albedo-link/intent'`}</CodeBlock>
            </div>
        </div>
    </>
}

export default DemoIntroView