import React from 'react'
import Feature from '../components/product-feature'

export default function UserFeaturesView() {
    return <div className="double-space">
        <Feature title="Secure key management" img="/img/features/feature-icon-management.svg">
            Secret keys never sent over the Internet and never exposed to third-party services.
        </Feature>
        <Feature title="Secure transaction signing" img="/img/features/feature-icon-signature.svg">
            Robust protection backed by isolated transactions signing inside the browser sandbox.
        </Feature>
        <Feature title="Web apps Single Sign-On" img="/img/features/feature-icon-sso.svg">
            Log into third-party websites with your Stellar account, just like with Google/Facebook OAuth.
        </Feature>
        <Feature title="Multi-account support" img="/img/features/feature-icon-accounts.svg">
            Use multiple accounts, as well as hardware wallets, and switch them on the fly.
        </Feature>
        <Feature title="Trustlines creation" img="/img/features/feature-icon-trustline.svg">
            Create anchor trustlines and participate in token airdrops in one click.
        </Feature>
        <Feature title="Works everywhere" img="/img/features/feature-icon-anydevice.svg">
            Seamless experience across different browsers and operating systems, desktops and smartphones.
        </Feature>
        <Feature title="SEP-0007 compatible" img="/img/features/feature-icon-link.svg">
            Handles "web+stellar" links – wider support for different ecosystem Stellar services.
        </Feature>
    </div>
}