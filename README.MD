# Albedo

**Albedo** provides a safe and reliable way to use your Stellar accounts without
trusting anyone with your secret key. Your sensitive data encrypted with
email+password combination is stored in the browser and on our servers in a
trustless manner. It means that we never have access to even the tiniest bit
of your personal information.

## Features

- Secure key management – your secret key is never exposed to third-party services.
- Secure transaction signing – transactions are signed without exposing a secret key.
- Web apps Single Sign-On – login to third-party websites, just like with Google
or Facebook OAuth.
- Multi-account support – use multiple accounts and switch them when you need it.
- Message signing tools – sign and verify arbitrary data with your private keys.
- [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) compatible – can be used to handle "web+stellar" links.
- Works everywhere – the same account operates seamlessly via desktops, smartphones, and tablets.

## Intents

There are 4 main groups of intents:

1. Request transaction signing. The signer app prepares and signs a transaction
which then can be returned to the initiator website or submitted directly
to the network.
2. Request specific action. Either "transfer funds", "trade tokens", or
"establish a trustline". Each action is effectively a simplified wrapper for
the transaction signing request. No custom logic or even Stellar JS SDK is
required on the initiator side.
3. Request information. The website may request Stellar account public key.
4. Request cryptographic signature of the arbitrary data. The website may
request a crypto signature to verify a keypair ownership (authentication,
secure messages exchange etc.)

## Authorization flows

The signer supports three authorization flows: 

**Interactive flow**

A popup window with request details is shown each time an initiator website
requests the action.

1. A user invokes some action on the third-party website (a wallet, DEX
interface, inflation pool etc). Let's say, he wants to create an offer.
2. The website prepares the requested transaction and it's XDR representation
in base64 format.
3. The website initiates the intent (see intent list in the project description)
using `intent` module that provides an interface for all supported intents.
4. In turn, `intent` module opens new pop-up window pointing to `albedo.link`.
Intent parameters are transmitted via `postMessage` API once the pop-up is open.
5. Albedo reads parameters and asks the user for a confirmation.
6. A user chooses a keypair from the list of stored accounts (or adds a new
one) and confirms the action.
7. Albedo signs the transaction the same way any other wallet do it.
8. A signed transaction in the XDR-serialized form sent back to the initiator site.
9. The initiator website receives a signed transaction envelope and may choose
either to submit it to the network or store somewhere in case if the tx needs
more signatures or if it has time bounds set.

Intent confirmation dialog always contains extended request information,
including intent description (like "Sign transaction"), initiator website
("origin: example.com"), risk level ("high", "medium", or "low"),
information about personal data disclosure, and safety status ("safe" or 
"potentially unsafe"). 

Intent-specific details allow a user to review the request before confirmation.
For instance, a dialog with `sing_tx` intent displays full transaction
information including all meaningful properties and the list of operations in a
human-friendly format adapted for the ordinary users.

**Implicit mode**

Implicit mode greatly simplifies the case with recurrent tasks, like using DEX
or sending multiple payments. It works similarly to OAuth. The application first
requests permission to execute certain actions without showing the confirmation
dialog window. If the a grants permission, a session token is created.
When application consequently asks for, say, signing a transaction, the
`intent` module sends session token alongside with the request and the action
is executed automatically, without showing a confirmation dialog.
The session is valid for max 24h, or until the user closes the browser window.
With interaction carried completely on the client-side, it is both secure and
trustless. This behavior allows implementing flow similarly to regular wallets.
A user grants permission to the third-party application only once upon login and
all other actions are executed transparently, without annoying repeated confirmations.

**SEP-0007 flow**

This callback-based flow supports [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) link format.
When Albedo is set as a default *web+stellar* link handler, it redirects the browser
to the signing interface instead of showing a pop-up authorization dialog.
A signed transaction can be either submitted to the network or returned to the
provided callback URL via POST request.

## Technical details

The project consists of three parts:

- The [**signer**](./frontend) website itself – provides a user-friendly
interface for key management and operation intents.
- Client [**intent**](./intent) module – JS library for Albedo integration.
- Server-side [**keystore**](https://github.com/stellar-expert/albedo-keystore) –
provides API for the fully trustless encrypted credentials storage.

The [intent](./intent) library supports the following actions ("intents"):

- `public_key` - requests account public key
- `sign_message` – requests arbitrary data signing
- `tx` – requests transaction signing (returns signed transaction envelope, can be used for multi-sig)
- `pay` – requests a payment
- `trust` – requests new trustline creation
- `buy_tokens` – requests trading on Stellar DEX
- `implicit_flow` – requests implicit session permission for given scopes 

Formal intent data contracts can be found [here](./intent/src/intent-interface.js).

The easiest way to start exploring Albedo is to play around with the demo 
[playground](https://albedo.link/demo).

The transaction signing interface supports muli-signature. It's possible to use
more than one key for signing. Albedo automatically detects all required signers
for a given transaction respecting thresholds of all included operations and
automatically returns a signed transaction once the thresholds are met. 

Arbitrary message signing is supported for hardware wallets as well as Albedo
stored accounts. It can be used for user identification purposes, third-party
application login, notary services, and many other things.

Albedo relies on the browser `postMessage` API for communication with
third-party applications. This secure and fast bi-directional connection
overcomes cross-origin problems and browser sandbox problems.

New encryption scheme ensures absolute anonymity on the server-side. A combination
of the user's email and password is hashed with [Argon2id](https://en.wikipedia.org/wiki/Argon2)
algorithm and then used as an AES encryption key for encrypting account data
(personal info, keypairs, etc.)

ED25519  public key derived from this seed serves as a unique user id on the
server-side. The client always sends only these two pieces of data - the public
key derived from the hash (this is not a Stellar account pubkey) and encrypted
data itself. So, the server never knows anything about the user apart from this
pubkey, making the storage really secure even if it is completely compromised.
There is no way to tell one account from another and it's impossible to
brute-force the secret key as it consists of email+password hashed with strong
algorithm and the email part is unknown to the attacker.

*Please note: it's a developer preview software version, do not store your real
Stellar account secret keys here.*

## Contributions

Contributions and suggestions are most welcome.

Please ensure that tests are passing before submitting the pull request.

```
npm test
```

## Questions and feedback

Check the [issue tracker](https://github.com/stellar-expert/albebo/issues)
for bug reports and feature requests.
