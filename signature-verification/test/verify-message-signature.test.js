import {verifyMessageSignature} from '../lib/albedo.signature.verification'

const correctData = {
    pubkey: 'GDWPMRQSLXNEHCXC7RTISZAHULB7FDDIOPR6CF5B5IUWOQXN2CUWN4LO',
    message: 'DGmk7s8gkhXMqRNsiCBanwL76Kt+5+WUzAOlWoh0nDs=',
    signature: '049a26b40c1a30be1cef3ef7a64af8ae305e7567ee2cac57e5a494e0036860b81dc417c005e4f4dff6ad6bc52f56f0e61e9d084c2718638bc4f78130fc14d20e'
}

test('filters malformed input', function () {
    expect(() => verifyMessageSignature()).toThrow(/Invalid public key format/)
    expect(() => verifyMessageSignature(correctData.pubkey.substr(0, 55))).toThrow(/Invalid public key format/)
    expect(() => verifyMessageSignature(correctData.pubkey, null)).toThrow(/Invalid message format/)
    expect(() => verifyMessageSignature(correctData.pubkey, correctData.message, 'kjusdkh')).toThrow(/Invalid signature format/)
    expect(() => verifyMessageSignature(correctData.pubkey, correctData.message, 'd4a4')).toThrow(/Invalid signature format/)
    expect(() => verifyMessageSignature(correctData.pubkey, correctData.message, new Uint8Array([1, 2]))).toThrow(/Invalid signature length/)
})

test('verifies the message', function () {
    expect(verifyMessageSignature(correctData.pubkey, correctData.message, correctData.signature)).toBeTruthy()
    expect(verifyMessageSignature(correctData.pubkey, correctData.message, new Uint8Array(64))).toBeFalsy()
    expect(verifyMessageSignature(correctData.pubkey, correctData.message + '1', correctData.signature)).toBeFalsy()
    expect(verifyMessageSignature('GCM5FP453ZN43I46CRAMU3SQP4KX4YQBMXQQFGIKNTKUK2AOEOWYRWW7', correctData.message, correctData.signature)).toBeFalsy()
})