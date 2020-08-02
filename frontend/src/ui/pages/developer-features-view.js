import React from 'react'
import Feature from '../components/product-feature'

export default function DeveloperFeaturesView() {
    return <div className="double-space">
        <Feature title="Universal account" img="/img/features/feature-icon-uniaccount.svg">
            Expand the reach of your app and forget about on-boarding. Every Stellar user is your user now.
            We'll take care of all account-related things.
        </Feature>
        <Feature title="Instant jumpstart" img="/img/features/feature-icon-jumpstart.svg">
            No need to create yet another keystore and transaction processing pipeline.
            Focus on what really matters for your app while saving months of work on trivial things.
        </Feature>
        <Feature title="Powerful abstraction layer" img="/img/features/feature-icon-abstraction.svg">
            Albedo handles all low-level details (transaction building, signing, multi-sig,
            validation, error processing) while providing a streamlined API interface.
        </Feature>
        <Feature title="Signing multi-tool" img="/img/features/feature-icon-multitool.svg">
            Multiple signing option – Albedo accounts, hardware wallets, direct secret
            key input, SEP-0007 links. Complex logic is hidden from the caller app
            behind the unified generic interface.
        </Feature>
        <Feature title="Easy to integrate" img="/img/features/feature-icon-integration.svg">
            A single lightweight JS package, no other dependencies, works out of the box
            in any modern browser – desktop or mobile.
        </Feature>
        <Feature title="Enhanced security" img="/img/features/feature-icon-security.svg">
            Security-first approach with a client-side encrypted keystore, fully sandboxed environment,
            and proven cryptography.
        </Feature>
        <Feature title="Effortless ICO and airdrops" img="/img/features/feature-icon-ico.svg">
            Setup tokensales and airdrop claim forms in minutes. Selling your asset on DEX?
            Embed a tiny script into your website, and you are good to go.
        </Feature>
        <Feature title="Public-key cryptography" img="/img/features/feature-icon-crypto.svg">
            Build custom authentication or notary schemes with arbitrary data signing
            and verification tools using Stellar keypairs.
        </Feature>
    </div>
}