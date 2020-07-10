# Albedo

[**Albedo**](https://albedo.link) provides a safe and reliable way to use
Stellar accounts without trusting anyone with a secret key.

It works like a bridge for other applications that allows them to ask
permissions to sign a transaction or verify identity on user's behalf, so the
same account can be used across the whole universe of Stellar applications.
Sensitive data is encrypted and safely stored in the browser – no one has access
to user's secret key.

From the developer's perspective, it takes only a few lines of code to turn
any website into a production-ready Stellar wallet. Transactions building,
signing, validation, errors handling – we have everything covered. There is no
need to implement a keystore, build a dozen interfaces for transaction
processing, and worry about security. In fact, things like payment request
can be implemented without any coding at all, therefore allowing instant
"stellarization" of any marketplace or even simple Wordpress site by simply
copy-pasting code produced by the 
[payment request generator](https://albedo.link/playground#payment-request).

At the same time, Albedo provides a set of low-level tools for working with
complex multi-sig schemes, making it a perfect match for advanced Stellar-based
applications and smart-contracts.

This project consists of two parts:

- [Frontend](./frontend) interface for [albedo.link](https://albedo.link)
website and browser extension UI – a thin wrapper which extends the
functionality of the main website.
- [Intent](./intent) library – a lightweight browser wrapper for Albedo API
that provides a promise-based interface for all supported intents.

For those who often use Stellar account we built browser extension – a thin
wrapper on top of [albedo.link](https://albedo.link) website which has the same
functionality as the main website, plus a few bonuses.

## Features

- Secure key management – secret keys never exposed to third-party services.
- Secure transaction signing – browser sandbox guarantees isolated transactions
signing environment.
- Web apps Single Sign-On – login to third-party websites, just like with Google
or Facebook OAuth.
- Multi-account support – use multiple accounts and switch them when you need it.
- Message signing tools – sign and verify arbitrary data with your private keys.
- [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md)
compatible – automatically handles "web+stellar" links.
- Works everywhere – the same account operates seamlessly on desktops,
smartphones, and any other device that has modern browser installed.

## How it works

The easiest way to start exploring Albedo is to play around with the demo 
[playground](https://albedo.link/demo). 

Albedo can be integrated on any website in three simple steps:

1. Download and install Albedo intent NPM package:

   ```shell script
   npm i -S @albedo-link/intent
   ```
   
2. Import the intent interface:

   ```js
   import albedo from '@albedo-link/intent'
   ```
   
3. Invoke an intent as a reaction on button click or something similar:

   ```js
   document.getElementById('#btn').addEventListener('click', () => {
     albedo.pay({
       amount: '10',
       destination: 'GCKOQGMTULKR55EWNHAXXJLTL25J3LT6BHHLBMDAVFKX3E32PCYVBO7M',
       asset_code: 'TST',
       asset_issuer: 'GBX6YUG3KCUEOBZRPN7TXBLMNXDW35XJOKDYFYIISDKDW4Y63LBCW6EI',
       network: 'testnet'
     })
       .then(res => console.log(res)) // everything is ok, parse response here
       .catch(e => console.error(e))  // handle errors or user's rejection
   })
   ```
   

Alternatively, you can import the UMD build in the browser directly from
[UNPKG](https://unpkg.com/):

```html
<script src="https://unpkg.com/@albedo-link/intent/lib/albedo.intent.js"></script>
```

(`albedo` is available in a global execution context) 

#### Available intents

The [intent module](./intent) supports the following actions ("intents"):

- `public_key` - requests account public key
- `sign_message` – requests arbitrary data signing
- `tx` – requests transaction signing
- `pay` – requests a payment
- `trust` – requests new trustline creation
- `exchange` – requests trading on Stellar DEX
- `implicit_flow` – requests implicit session permission for one or more scopes

Check [intent module docs](./intent) for the detailed description, parameter
definitions, and usage examples.

#### Authorization flows

The signer supports three authorization flows: 

**Interactive flow**

A popup window with request details is shown each time an initiator website
requests the action.

1. A user invokes some action on the third-party website (a wallet, DEX
interface, inflation pool etc).
2. The website prepares the requested transaction and its XDR representation
in base64 format. Alternatively, simple operations like `pay` or `exchange` can
be used to request an action without building a tx.
3. The website initiates the intent (see [available intents](#available-intents)
list) using `albedo-intent` module that provides an interface for all supported
intents.
4. In turn, `albedo-intent` module opens new pop-up window pointing to
`albedo.link`. Intent parameters are transmitted via `postMessage` API once
the pop-up is open.
5. Albedo reads parameters and asks the user for a confirmation.
6. A user chooses an account from the list of stored accounts (or adds a new
one) and confirms the action.
7. Albedo signs the transaction the same way any other wallet does it.
8. A signed transaction in the XDR-serialized form sent back to the initiator site.
9. The initiator website receives a signed transaction envelope and may choose
either to submit it to the network or store somewhere in case if the tx needs
more signatures or time bounds prevent it from submitting right away.

Intent confirmation dialog always contains extended request information,
including intent description (like "Sign transaction"), initiator website
("origin: example.com"), risk level ("high", "medium", or "low"),
and safety status ("safe" or "potentially unsafe"). 

Intent-specific details allow a user to review the request before confirmation.
For instance, a dialog with `tx` intent displays full transaction information
including all meaningful properties and the list of operations in a
human-friendly format adapted for the ordinary users.

**Implicit mode**

Implicit mode simplifies recurrent tasks, like using DEX or sending multiple
payments. It works similarly to OAuth. The application first
requests permission to execute certain actions without showing the confirmation
dialog window. If the a grants permission, a session token is created.

When application consequently asks for, say, signing a transaction, the
`intent` module sends session token alongside with the request and the action
is executed automatically, without showing a confirmation dialog.
The session is valid for max 24h, or until the user closes the browser window.
With interaction carried completely on the client-side, it is both secure and
trustless.

This behavior allows implementing flow similarly to regular wallets.
A user grants permission to the third-party application only once upon login and
all other actions are executed transparently, without annoying repeated
confirmations.

**SEP-0007 flow**

This callback-based flow supports [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) link format.
When Albedo is set as a default *web+stellar* link handler (or when the browser
extension installed), it redirects the browser to the signing interface
instead of showing a pop-up authorization dialog.

A signed transaction can be either submitted to the network or returned to the
provided callback URL via POST request.

## Development

Please refer to
 
- [Frontend](./frontend/#development---web-app) development section.
- [Extension](./frontend/#development---extension) development section.
- [Intent module](./intent/#development) development section.

## Contributions

Contributions and suggestions are most welcome.

Please ensure that tests are passing before submitting the pull request.

```
npm test
```

## Questions and feedback

Check the [issue tracker](https://github.com/stellar-expert/albedo/issues)
for bug reports and feature requests.
