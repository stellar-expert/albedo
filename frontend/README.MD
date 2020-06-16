# Albedo Frontend

Frontend website of [Albedo](../README.MD) signer.
Provides a user-friendly interface for key management and operation intents.

Albedo - your single access point to all Stellar services.

## Installation and configuration

#### System requirements

- Node.JS v8.6.0+ for assets compilation. 
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
compilation or in runtime via `window.clientConfig` variable.

#### Deployment

Build sources

```
npm run bild
```

And copy `./public` directory contents to the website root. 

