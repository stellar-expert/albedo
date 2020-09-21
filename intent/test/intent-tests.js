import { assert } from 'chai'
import intentLib from '../src/index'
import frontendStub from './intent-test-utils'

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
            expected: { intent: 'public_key' }
        },
        {
            desc: 'Sign message intent without message prop',
            intent: 'sign_message',
            method: 'signMessage',
            params: {},
            expected: { intent: 'sign_message' },
            shouldFail: true //no message param
        },
        {
            desc: 'Sign message intent',
            intent: 'sign_message',
            method: 'signMessage',
            params: { message: 'Test message' },
            expected: { intent: 'sign_message' }
        },
        {
            desc: 'Tx intent without xdr prop',
            intent: 'tx',
            method: 'tx',
            params: {},
            expected: { intent: 'tx' },
            shouldFail: true //no xdr param
        },
        {
            desc: 'Tx intent',
            intent: 'tx',
            method: 'tx',
            params: { xdr: 'tx in xdr format' },
            expected: { intent: 'tx' },
        },
        {
            desc: 'Pay intent without amount and destination props',
            intent: 'pay',
            method: 'pay',
            params: {},
            expected: { intent: 'pay' },
            shouldFail: true //no amount and destination params
        },
        {
            desc: 'Pay intent without destination prop',
            intent: 'pay',
            method: 'pay',
            params: { amount: 1 },
            expected: { intent: 'pay' },
            shouldFail: true //no destination param
        },
        //no check for amount type
        // {
        //     desc: 'Pay intent with invalid amount value prop',
        //     intent: 'pay',
        //     method: 'pay',
        //     params: { amount: 'asdsa', destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
        //     expected: { intent: 'pay' },
        //     shouldFail: true //invalid amount
        // },
        {
            desc: 'Pay intent without amount prop',
            intent: 'pay',
            method: 'pay',
            params: { destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expected: { intent: 'pay' },
            shouldFail: true //no amount param
        },
        //no check for ed25519 pubkey
        // {
        //     desc: 'Pay intent with invalid pubkey',
        //     intent: 'pay',
        //     method: 'pay',
        //     params: { destination: 'invalid pubkey', amount: 1 },
        //     expected: { intent: 'pay' },
        //     shouldFail: true //invalid pubkey
        // },
        {
            desc: 'Pay intent',
            intent: 'pay',
            method: 'pay',
            params: { amount: 1, destination: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expected: { intent: 'pay' }
        },
        {
            desc: 'Trustline intent without asset_code and asset_issuer props',
            intent: 'trust',
            method: 'trust',
            params: {},
            expected: { intent: 'trust' },
            shouldFail: true //no asset_code and asset_issuer params
        },
        {
            desc: 'Trustline intent without asset_code prop',
            intent: 'trust',
            method: 'trust',
            params: { asset_code: 'ASSET' },
            expected: { intent: 'trust' },
            shouldFail: true //no asset_code param
        },
        {
            desc: 'Trustline intent without asset_issuer prop',
            intent: 'trust',
            method: 'trust',
            params: { asset_issuer: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expected: { intent: 'trust' },
            shouldFail: true //no asset_issuer param
        },
        {
            desc: 'Trustline intent',
            intent: 'trust',
            method: 'trust',
            params: { asset_code: 'ASSET', asset_issuer: 'GCVDRFL5OSQWH6FCC35S2DJ7PPMARI3ASMVTSYXWZH44B3AMVYXUJYWF' },
            expected: { intent: 'trust' },
        },
        {
            desc: 'Exchange intent without amount and max_price props',
            intent: 'exchange',
            method: 'exchange',
            params: {},
            expected: { intent: 'exchange' },
            shouldFail: true //no amount and max_price params
        },
        {
            desc: 'Exchange intent without max_price prop',
            intent: 'exchange',
            method: 'exchange',
            params: { amount: 1 },
            expected: { intent: 'exchange' },
            shouldFail: true //no max_price param
        },
        {
            desc: 'Exchange intent without amount prop',
            intent: 'exchange',
            method: 'exchange',
            params: { max_price: 1 },
            expected: { intent: 'exchange' },
            shouldFail: true //no amount param
        },
        {
            desc: 'Exchange intent',
            intent: 'exchange',
            method: 'exchange',
            params: { amount: 1, max_price: 1 },
            expected: { intent: 'exchange' }
        },
        {
            desc: 'Implicit flow intent without intents prop',
            intent: 'implicit_flow',
            method: 'implicitFlow',
            params: {},
            expected: { intent: 'implicit_flow' },
            shouldFail: true //no intents param
        },
        {
            desc: 'Implicit flow intent',
            intent: 'implicit_flow',
            method: 'implicitFlow',
            params: { intents: 'tx' },
            expected: { intent: 'implicit_flow' }
        },
    ]
    for (let { method, params, expected, shouldFail, desc } of testCases) {
        it(desc, async function () {
            this.timeout(300000)
            let error
            try {
                const res = await intentLib[method](params)
                for (const prop in expected) {
                    const result = res[prop]
                    const expectedResult = expected[prop]
                    if (result !== expectedResult)
                        assert.fail(`${prop} expected to be equal to '${expectedResult}', but result was '${result}'`)
                }
            } catch (err) {
                error = err
            }
            if (shouldFail)
                assert.equal(true, !!error, 'This test should have failed')
            else
                assert.equal(undefined, error, 'This test should have passed successfully')
        })
    }
})