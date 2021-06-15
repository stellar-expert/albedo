import React from 'react'
import Highlight from '../components/highlight'

export default function DemoExtraInfoView({intent, allParams, result}) {
    switch (intent) {
        case 'public_key':
        case 'sign_message':
            const msg = allParams?.token || allParams?.message || 'DGmk7s8gkhXMqRNsiCBanwL76Kt+5+WUzAOlWoh0nDs=',
                parsedResult = result ? JSON.parse(result) : {},
                pubkey = parsedResult.pubkey || 'GDWPMRQSLXNEHCXC7RTISZAHULB7FDDIOPR6CF5B5IUWOQXN2CUWN4LO',
                signature = parsedResult.signature || '049a26b40c1a30be1cef3ef7a64af8ae305e7567ee2cac57e5a494e0036860b81dc417c005e4f4dff6ad6bc52f56f0e61e9d084c2718638bc4f78130fc14d20e'
            return <div className="space">
                To ensure the validity of the returned result, the signature should be verified using{' '}
                <a href="https://www.npmjs.com/package/@albedo-link/signature-verification"><code>@albedo-link/signature-verification</code></a>
                {' '}package.
                <Highlight lang="js" children={`import {verifyMessageSignature} from '@albedo-link/signature-verification'

const isValid = verifyMessageSignature(
  '${pubkey}', //public key from response
  '${msg.replace('\'','\\\'')}', //original text to sign
  '${signature}' //signature from response
)`}/>
            </div>
        default:
            return null
    }
}