import React from 'react'

function ExampleView({title, img, children}) {
    return <>
        <h3 className="space">{title}</h3>
        <p className="dimmed text-small">{children}</p>
        <img src={`/img/examples/${img}`} style={{border:'1px solid #d4eef7'}}/>
    </>
}

function ExamplesView() {
    return <div>
        <h2>Usage examples</h2>
        <ExampleView title="Account signup process" img="albedo-signup-flow.gif">
            The signup process is quite straight-forward and can be accomplished even directly from the intent
            confirmation page.
        </ExampleView>
        <ExampleView title="Transaction signing process" img="albedo-tx-signing-account.gif">
            Albedo exposes a simple interface for basic actions like payment, tokens purchase, trustline creation,
            as well as arbitrary transactions signing.
        </ExampleView>
        <ExampleView title="Message signing with Albedo account" img="albedo-message-signing-account.gif">
            Arbitrary message signing can be useful for a wide range of tasks, like simple OAuth-like
            authentication for applications, delegated actions approval/confirmation, notary services, identity
            verification, and many other applications based on public-key cryptography.
        </ExampleView>
        <ExampleView title="Message signing with Ledger hardware wallet" img="albedo-message-signing-ledger.gif">
            Hardware wallet integration has always been a tricky part for most applications, as it requires a special
            separate transaction signing flow plus extended error handling. We made it as simple as possible, allowing
            not only transaction signing, but also arbitrary messages signing. From now on, applications don't need to
            care about the way a user prefers to sign a transaction/message – the intent interface provides the
            unmatched level of abstraction.
        </ExampleView>
        <ExampleView title="Implicit flow" img="albedo-implicit-mode.gif">
            One of the most frustrating issues with delegated signing is the need to follow the full cycle of redirects
            and provide credentials while executing the repeated tasks (for example, trading on DEX). Albedo introduces
            the concept of client sessions which allows an app to request specific permissions from a user and execute
            subsequent requests without asking a confirmation each time. This convenient behavior provides a balance
            between security and usability.
        </ExampleView>
    </div>
}

export default ExamplesView