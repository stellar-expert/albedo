import responder from '../../src/actions/responder'
import axios from 'axios'
import {Transaction, TransactionBuilder, Operation, Network, Networks} from 'stellar-base'
import {buildContext, loadAccount, loadKeypair} from './fake-action-context-builder'

const knownHorizonNetworks = {
    'https://horizon.stellar.org': Networks.PUBLIC,
    'https://horizon-testnet.stellar.org': Networks.TESTNET
}

const anotherAccount = 'GA6USLTFW7FBEJZAKLDMKK2CZV2GYGPHL4G6PL6J65YTYYSQMM2LFKUZ'

describe('responder (tx-actions)', function () {
    let horizonCalls = []

    beforeEach(function () {
        horizonCalls = [] //reset
    })

    before(function () {
        axios.get.mockImplementation((url) => {
            const parsedUrl = new URL(url)
            if (!knownHorizonNetworks[parsedUrl.origin]) return Promise.reject(new Error('Unknown origin ' + parsedUrl.origin))
            if (parsedUrl.pathname.indexOf('/accounts/') !== 0) return Promise.reject(new Error('Unsupported Horizon endpoint ' + url))
            const address = parsedUrl.pathname.replace('/accounts/', '')
            horizonCalls.push('get_' + address)
            return Promise.resolve({
                data: {
                    sequence: Math.floor(Math.random() * 100000000).toString(),
                    id: address,
                    account_id: address
                }
            })
        })

        axios.post.mockImplementation((url, payload) => {
            const parsedUrl = new URL(url)
            if (parsedUrl.pathname !== '/transactions') return Promise.reject(new Error('Unsupported Horizon endpoint ' + url))
            horizonCalls.push('post_tx')
            //parse arguments
            const parsedQuery = payload.split('&').reduce((res, element) => {
                const [key, value] = element.split('=')
                res[key] = decodeURIComponent(value)
                return res
            }, {})
            //verify transaction
            const tx = new Transaction(parsedQuery.tx),
                sourceAccountExpectedHint = tx.tx.sourceAccount().value().slice(-4)
            //source account signature should be present
            if (!tx.signatures.some(s => s.hint().equals(sourceAccountExpectedHint))) return Promise.reject(new Error('No source account signature found.'))

            //set current network based on the Horizon request origin
            //Network.use(new Network(knownHorizonNetworks[parsedUrl.origin]))

            //TODO: check transaction consistency and signature
            return Promise.resolve({data: {hash: tx.hash().toString('hex')}})
        })
    })

    /**
     * Executes intent test case using registered responder actions.
     * @param {Object} testCaseData - Data to submit.
     * @param {String} testCaseData.intent - Requested intent.
     * @param {Array<string>} [expectedHorizonCalls] - Custom sequence of expected Horizon API invocations.
     * @param {function} [additionalCheck] - Arbitrary checks.
     * @return {Promise}
     */
    async function confirmIntent(testCaseData, {expectedHorizonCalls, additionalCheck} = {}) {
        let account = loadAccount(),
            res = await responder.process(buildContext(testCaseData))
        if (testCaseData.prepare) {
            expect(res).to.include.keys([
                'signed_envelope_xdr',
                'tx_signature'
            ])
            delete testCaseData.prepare
        } else {
            expect(res).to.include.keys([
                'tx_hash',
                'horizon'
            ])
        }
        expect(res).to.include({
            pubkey: account.accountId(),
            network: 'public'
        }).and.include(testCaseData)

        expect(horizonCalls).to.be.deep.equal(expectedHorizonCalls || ['get_' + account.accountId(), 'post_tx'])

        additionalCheck && additionalCheck(res)

        horizonCalls = []
    }

    it('registers actions in responder', function () {
        ['tx', 'pay', 'inflation_vote', 'trust'].forEach(intent => {
            expect(responder.reactions[intent]).to.be.a('function')
        })
    })

    it('fails to sign an invalid xdr', function () {
        return expect(responder.process(buildContext({intent: 'tx', xdr: '?'})))
            .to.be.rejectedWith(/Failed to process the transaction/)
    })

    it('signs and submits a valid tx xdr', async function () {
        let account = loadAccount(),
            tx = new TransactionBuilder(account).addOperation(Operation.inflation()).build()

        await confirmIntent({
            intent: 'tx',
            xdr: tx.toEnvelope().toXDR().toString('base64')
        }, {expectedHorizonCalls: ['post_tx']})
    })

    it('signs and returns a valid tx xdr when the "prepare" parameter received', async function () {
        let account = loadAccount(),
            tx = new TransactionBuilder(account).addOperation(Operation.inflation()).build()

        await confirmIntent({
            intent: 'tx',
            prepare: '1',
            xdr: tx.toEnvelope().toXDR().toString('base64')
        }, {expectedHorizonCalls: []})
    })


    it('substitutes account and sequence in tx xdr according to SEP-0007', async function () {
        let account = loadAccount(),
            accountToSubstitute = loadAccount('-1'),
            tx = new TransactionBuilder(accountToSubstitute).addOperation(Operation.inflation()).build()

        //replace source account with zero buffer
        tx.tx._attributes.sourceAccount._value = Buffer.from('\0'.repeat(32))

        await confirmIntent({
            intent: 'tx',
            prepare: '1',
            xdr: tx.toEnvelope().toXDR().toString('base64')
        }, {
            expectedHorizonCalls: ['get_' + account.accountId()],
            additionalCheck: function (res) {
                const responseTx = new Transaction(res.signed_envelope_xdr)

                //check substitution
                expect(responseTx.source).to.be.equal(account.accountId())
                expect(responseTx.sequence).not.to.be.equal('0')
            }
        })
    })

    for (let testCase of [
        {title: 'xlm without memo', data: {}},
        {title: 'custom token without memo', data: {asset_code: 'test', asset_issuer: anotherAccount}},
        {title: 'xlm with memo', data: {memo: '1234567', memo_type: 'MEMO_ID'}}
    ]) {
        it('sends a payment - ' + testCase.title, async function () {
            await confirmIntent(Object.assign({
                intent: 'pay',
                amount: '1.1',
                destination: anotherAccount
            }, testCase.data))
        })
    }

    it('establishes a trustline', async function () {
        await confirmIntent({
            intent: 'trust',
            asset_code: 'U' + Math.random().toFixed(5).split('.').pop() + (new Date().getTime() % 1000000),
            asset_issuer: anotherAccount
        }, {
            additionalCheck: function (res) {
                expect(res).to.include({limit: '922337203685.4775807'})
            }
        })
    })

    it('votes for an inflation destination', async function () {
        await confirmIntent({
            intent: 'inflation_vote',
            destination: anotherAccount
        })
    })
})
