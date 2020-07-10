import React from 'react'
import Feature from '../components/product-feature'

export default function UserFeaturesView() {
    return <div className="double-space">
        <Feature title="Secure key management" img="/img/features/feature-icon-management.svg">
            Your secret key is never exposed to third-party services
        </Feature>
        <Feature title="Secure transaction signing" img="/img/features/feature-icon-signature.svg">
            Isolated transactions signing inside the browser sandbox
        </Feature>
        <Feature title="Web apps Single Sign-On" img="/img/features/feature-icon-sso.svg">
            Log into third-party websites, just like Google/Facebook OAuth
        </Feature>
        <Feature title="Multi-account support" img="/img/features/feature-icon-accounts.svg">
            Use multiple accounts and switch them when you need it
        </Feature>
        <Feature title="Trustlines creation" img="/img/features/feature-icon-trustline.svg">
            Anchor trustlines and token airdrops in one click
        </Feature>
        <Feature title="Works everywhere" img="/img/features/feature-icon-anydevice.svg">
            Seamless experience on desktops, smartphones, and tablets
        </Feature>
        <Feature title="SEP-0007 compatible" img="/img/features/feature-icon-link.svg">
            Can be used to handle "web+stellar" links
        </Feature>
    </div>
}