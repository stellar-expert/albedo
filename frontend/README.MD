# Albedo Frontend

[Albedo](../README.MD) wallet frontend website and browser extensions.
Provides a user-friendly interface for key management, basic wallet operations, and operation intents.

Albedo - your single access point to all Stellar services.

## Installation and configuration

#### System requirements

- Node.JS v14.15.0+ for assets compilation. 
- Any web server that allows static files hosting.

#### Assets compilation

```
npm i
npm run build
```

#### Configuration

Configuration parameters can be found in [default-config.json](./default-config.json).

```
{
  "networks": {
    "public": {
      "horizon": "https://horizon.stellar.org"
    },
    "testnet": {
      "horizon": "https://horizon-testnet.stellar.org"
    }
  }
}
```

- `networks` section contains known Stellar networks and horizon endpoints.

Configuration parameters may be overridden in `default-config.json` before the
compilation.

## Development - web app

#### Running a development environment

Start webpack development server with auto-refresh on changes:

```shell script
npm run watch-app
```

Webpack uses development TLS certificates for the `localhost`, so you'll have to
add a browser exception for this certificate. 

#### Production build

Run

```
npm run build-app
```

And then copy the contents of the `distr/app` directory to the web root
directory on the server.

## Development - extension

Install required packages

```
npm i
```

Start development environment with automatic rebuilds when file changes spotted

```
npm run watch-extension
```

To test it locally, use ["Load unpacked" extension option](chrome://extensions/)
in Google Chrome or ["Load Temporary Add-on..."](about:debugging#/runtime/this-firefox)
in Firefox.

Please note that you'll have to reload extension manually each time rebuild
happens to update extension files in the browser.

#### Preparing extension package for publishing

1. Build extension files using `build-extension` npm script.
   ```
   npm run build-extension
   ```
2. Upload the extension package file `distr/extension.zip` to
[Google Webstore dev console](https://chrome.google.com/u/2/webstore/devconsole/)
or [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).

## Technical details

#### Communication pipeline

Albedo relies on the browser `postMessage` API for communication with
third-party applications. This secure and fast bi-directional connection
overcomes cross-origin problems and browser sandbox problems. The actions
invoked are called "intents".

#### Intents

There are 4 main groups of intents:

1. Request transaction signing.  
The signer app prepares and signs a transaction which then can be returned to
the initiator website or submitted directly to the network.
2. Request specific account operation.  
Either "transfer funds", "trade tokens", or "establish a trustline".
Each action is effectively a simplified wrapper for the transaction signing
request. No custom logic or even Stellar SDK is required on the initiator side.
3. Request information.  
For example, the website may request Stellar account public key.
4. Request cryptographic signature of the arbitrary data.  
The initiator may request a crypto signature to verify a keypair ownership
(authentication, secure messages exchange etc.)

#### Cryptography

User's password is hashed using [Argon2id](https://en.wikipedia.org/wiki/Argon2)
algorithm and then used for encrypting account secret key with AES.
