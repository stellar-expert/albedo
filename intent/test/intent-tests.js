import { assert } from 'chai'
import intentLib from '../src/index'
import frontendStub from './intent-test-utils'
import intentErrors from '../src/intent-errors'
import intentInterface from '../src/intent-interface'

describe('intent-albedo-link tests', function () {
    before(() => {
        frontendStub.setup()
    })
    after(() => {
        frontendStub.destroy()
    })

    const testCases = [
        {
            desc: 'Pubkey intent',
            intent: 'public_key',
            method: 'publicKey',
            params: {},
        },
        {
            desc: 'Sign message intent without message prop',
            intent: 'sign_message',
            method: 'signMessage',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no message param
        },
        {
            desc: 'Sign message intent',
            intent: 'sign_message',
            method: 'signMessage',
            params: { message: 'Test message' },
        },
        {
            desc: 'Tx intent without xdr prop',
            intent: 'tx',
            method: 'tx',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no xdr param
        },
        {
            desc: 'Tx intent',
            intent: 'tx',
            method: 'tx',
            params: { xdr: 'tx in xdr format' },
        },
        {
            desc: 'Pay intent without amount and destination props',
            intent: 'pay',
            method: 'pay',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no amount and destination params
        },
        {
            desc: 'Pay intent without destination prop',
            intent: 'pay',
            method: 'pay',
            params: { amount: 1 },
            expectedError: intentErrors.invalidIntentRequest //no destination param
        },
        //no check for amount type
        // {
        //     desc: 'Pay intent with invalid amount value prop',
        //     intent: 'pay',
        //     method: 'pay',
        //     params: { amount: 'asdsa', destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
        //     shouldFail: true //invalid amount
        // },
        {
            desc: 'Pay intent without amount prop',
            intent: 'pay',
            method: 'pay',
            params: { destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expectedError: intentErrors.invalidIntentRequest //no amount param
        },
        //no check for ed25519 pubkey
        // {
        //     desc: 'Pay intent with invalid pubkey',
        //     intent: 'pay',
        //     method: 'pay',
        //     params: { destination: 'invalid pubkey', amount: 1 },
        //     shouldFail: true //invalid pubkey
        // },
        {
            desc: 'Pay intent',
            intent: 'pay',
            method: 'pay',
            params: { amount: 1, destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
        },
        {
            desc: 'Trustline intent without asset_code and asset_issuer props',
            intent: 'trust',
            method: 'trust',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no asset_code and asset_issuer params
        },
        {
            desc: 'Trustline intent without asset_code prop',
            intent: 'trust',
            method: 'trust',
            params: { asset_code: 'ASSET' },
            expectedError: intentErrors.invalidIntentRequest //no asset_code param
        },
        {
            desc: 'Trustline intent without asset_issuer prop',
            intent: 'trust',
            method: 'trust',
            params: { asset_issuer: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expectedError: intentErrors.invalidIntentRequest //no asset_issuer param
        },
        {
            desc: 'Trustline intent',
            intent: 'trust',
            method: 'trust',
            params: { asset_code: 'ASSET', asset_issuer: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
        },
        {
            desc: 'Exchange intent without amount and max_price props',
            intent: 'exchange',
            method: 'exchange',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no amount and max_price params
        },
        {
            desc: 'Exchange intent without max_price prop',
            intent: 'exchange',
            method: 'exchange',
            params: { amount: 1 },
            expectedError: intentErrors.invalidIntentRequest //no max_price param
        },
        {
            desc: 'Exchange intent without amount prop',
            intent: 'exchange',
            method: 'exchange',
            params: { max_price: 1 },
            expectedError: intentErrors.invalidIntentRequest //no amount param
        },
        {
            desc: 'Exchange intent',
            intent: 'exchange',
            method: 'exchange',
            params: { amount: 1, max_price: 1 },
        },
        {
            desc: 'Implicit flow intent without intents prop',
            intent: 'implicit_flow',
            method: 'implicitFlow',
            params: {},
            expectedError: intentErrors.invalidIntentRequest //no intents param
        },
        {
            desc: 'Implicit flow intent',
            intent: 'implicit_flow',
            method: 'implicitFlow',
            params: { intents: 'tx' },
        },
    ]
    for (let { method, intent, params, expectedError, desc } of testCases) {
        it(desc, async function () {
            this.timeout(300000)
            let error
            try {
                const res = await intentLib[method](params)
                const expected = intentInterface[intent].returns
                for (const prop of expected) {
                    if (!res.hasOwnProperty(prop))
                        assert.fail(`Response must contain property "${prop}"`)
                }
            } catch (err) {
                error = err
            }
            if (expectedError) {
                assert.equal(true, !!error, 'This test should have failed')
                assert.equal(expectedError.code, error.code, `Expected error: "${expectedError.message}"; received error: "${error.message}".`)
            }
            else if (error)
                assert.fail(`This test should have passed successfully, but error "${error.message}" was received.`)
        })
    }
})