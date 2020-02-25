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
            intent: 'public_key',
            method: 'requestPublicKey',
            params: {},
            expected: {intent: 'public_key'}
        }
    ]
    for (let {intent, method, params, expected} of testCases) {
        it(`generates expected intent params for ${intent} intent`, async function () {
            const res = await intentLib[method](params)

            expect(res).to.be.deep.equal(expected)
        })
    }
})