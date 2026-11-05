import {Keypair, TransactionBuilder, Operation, Networks, Asset, xdr} from '@stellar/stellar-sdk'
import registerTxActions from '../../src/actions/tx-actions'
import {zeroAccount} from '../../src/util/tx-replace-utils'
import {buildContext, loadAccount, loadKeypair} from './fake-action-context-builder'

//replace the UI framework with the only helpers used by the tested modules (the full package requires DOM)
jest.mock('@stellar-expert/ui-framework', () => ({
    ...jest.requireActual('@stellar-expert/ui-framework/stellar/signature-hint-utils'),
    calculateAvailableBalance: jest.fn(),
    parseAssetFromObject: jest.fn(),
    useStellarNetwork: jest.fn(),
    stringifyQuery: jest.fn()
}))
//no stored accounts (the real account manager relies on browser storage)
jest.mock('../../src/state/account-manager', () => ({
    __esModule: true,
    default: {accounts: [], get: () => null}
}))
jest.mock('../../src/storage/storage-provider', () => {
    const items = new Map()
    return {
        __esModule: true,
        default: {
            getItem: async key => items.get(key) ?? null,
            setItem: async (key, value) => void items.set(key, value),
            removeItem: async key => void items.delete(key),
            enumerateKeys: async () => [...items.keys()]
        }
    }
})

const horizonOrigin = 'https://horizon-testnet.stellar.org'
const signerSequence = '1000'
const anotherAccount = 'GA6USLTFW7FBEJZAKLDMKK2CZV2GYGPHL4G6PL6J65YTYYSQMM2LFKUZ'
const unfundedAccount = Keypair.random().publicKey()

const feeStats = {
    last_ledger_base_fee: '100',
    ledger_capacity_usage: '0.5',
    fee_charged: {max: '200', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '100', p70: '100', p80: '100', p90: '150', p95: '200', p99: '200'},
    max_fee: {max: '1000', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '200', p70: '200', p80: '300', p90: '500', p95: '800', p99: '1000'}
}

function accountRecord(address) {
    return {
        id: address,
        account_id: address,
        sequence: address === loadKeypair().publicKey() ? signerSequence : '1',
        subentry_count: 0,
        last_modified_ledger: 1,
        thresholds: {low_threshold: 0, med_threshold: 0, high_threshold: 0},
        flags: {auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false},
        balances: [{asset_type: 'native', balance: '100.0000000'}],
        signers: [{key: address, weight: 1, type: 'ed25519_public_key'}],
        data: {},
        num_sponsoring: 0,
        num_sponsored: 0,
        paging_token: address,
        _links: {}
    }
}

function jsonResponse(body, status = 200) {
    return {status, body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}
}

describe('tx-actions', () => {
    const reactions = {}
    let horizonCalls = []

    beforeAll(() => {
        registerTxActions((intent, reaction) => reactions[intent] = reaction)
        fetch.mockResponse(async req => {
            const url = new URL(req.url)
            if (url.origin !== horizonOrigin)
                return jsonResponse({title: 'Unexpected Horizon origin ' + url.origin}, 500)
            horizonCalls.push(url.pathname)
            if (url.pathname === '/fee_stats')
                return jsonResponse(feeStats)
            const [, address] = /^\/accounts\/(\w+)$/.exec(url.pathname) || []
            if (address && address !== unfundedAccount)
                return jsonResponse(accountRecord(address))
            return jsonResponse({type: 'https://stellar.org/horizon-errors/not_found', title: 'Resource Missing', status: 404}, 404)
        })
    })

    beforeEach(() => {
        horizonCalls = []
    })

    afterAll(() => {
        fetch.resetMocks()
    })

    /**
     * Execute intent reaction and verify the signed transaction.
     * @param {Object} intentData - Intent name and intent params.
     * @return {Promise<{res: Object, tx: Transaction}>}
     */
    async function confirmIntent(intentData) {
        const {intent, ...intentParams} = intentData
        const context = await buildContext({network: 'testnet', ...intentData})
        const res = await reactions[intent](context)
        const signer = loadKeypair()
        expect(res).toMatchObject({...intentParams, intent, pubkey: signer.publicKey(), network: 'testnet'})
        //verify the signature and transaction hash
        const tx = TransactionBuilder.fromXdr(res.signed_envelope_xdr, Networks.TESTNET)
        expect(res.tx_hash).toEqual(xdr.encodeBytes(tx.hash(), 'hex'))
        expect(tx.signatures).toHaveLength(1)
        expect(signer.verify(tx.hash(), tx.signatures[0].signature.toBytes())).toBe(true)
        return {res, tx}
    }

    it('registers tx intent reactions', () => {
        for (const intent of ['tx', 'pay', 'trust', 'exchange']) {
            expect(reactions[intent]).toBeInstanceOf(Function)
        }
    })

    it('fails to process a tx intent without a valid transaction', async () => {
        const context = await buildContext({intent: 'pay', network: 'testnet', amount: '1', destination: anotherAccount})
        context.actionContext.intent = 'tx' //tx intents can't be built from intent params
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        await expect(reactions.tx(context)).rejects.toMatchObject({code: -1})
        consoleError.mockRestore()
    })

    it('signs a valid tx xdr', async () => {
        const tx = new TransactionBuilder(loadAccount('5'), {fee: '100', networkPassphrase: Networks.TESTNET})
            .addOperation(Operation.bumpSequence({bumpTo: '10'}))
            .setTimeout(0)
            .build()

        const {tx: signedTx} = await confirmIntent({intent: 'tx', xdr: tx.toXdr()})

        expect(signedTx.source).toEqual(loadKeypair().publicKey())
        expect(signedTx.sequence).toEqual('6')
        expect(horizonCalls).toEqual(['/accounts/' + loadKeypair().publicKey()]) //signers schema discovery
    })

    it('substitutes source account and sequence in tx xdr according to SEP-0007', async () => {
        const tx = new TransactionBuilder(loadAccount('-1', zeroAccount), {fee: '100', networkPassphrase: Networks.TESTNET})
            .addOperation(Operation.bumpSequence({bumpTo: '10'}))
            .setTimeout(0)
            .build()

        const {tx: signedTx} = await confirmIntent({intent: 'tx', xdr: tx.toXdr()})

        expect(signedTx.source).toEqual(loadKeypair().publicKey())
        expect(signedTx.sequence).toEqual((BigInt(signerSequence) + 1n).toString())
    })

    for (const testCase of [
        {title: 'xlm without memo', data: {}, asset: Asset.native()},
        {title: 'custom token without memo', data: {asset_code: 'TEST', asset_issuer: anotherAccount}, asset: new Asset('TEST', anotherAccount)},
        {title: 'xlm with memo', data: {memo: '1234567', memo_type: 'MEMO_ID'}, asset: Asset.native(), memo: {type: 'id', value: '1234567'}}
    ]) {
        it('sends a payment - ' + testCase.title, async () => {
            const {tx} = await confirmIntent({intent: 'pay', amount: '1.1', destination: anotherAccount, ...testCase.data})

            expect(tx.source).toEqual(loadKeypair().publicKey())
            //cached account info is reused and incremented by consecutive transactions
            expect(BigInt(tx.sequence)).toBeGreaterThan(BigInt(signerSequence))
            expect(tx.operations).toHaveLength(1)
            expect(tx.operations[0]).toMatchObject({type: 'payment', destination: anotherAccount, amount: '1.1000000'})
            expect(tx.operations[0].asset.equals(testCase.asset)).toBe(true)
            expect(tx.memo).toMatchObject(testCase.memo || {type: 'none'})
        })
    }

    it('creates destination account when sending xlm to a non-existing account', async () => {
        const {tx} = await confirmIntent({intent: 'pay', amount: '5', destination: unfundedAccount})

        expect(tx.operations[0]).toMatchObject({type: 'createAccount', destination: unfundedAccount, startingBalance: '5.0000000'})
    })

    it('establishes a trustline', async () => {
        const {tx} = await confirmIntent({intent: 'trust', asset_code: 'USD', asset_issuer: anotherAccount})

        expect(tx.operations[0]).toMatchObject({type: 'changeTrust', limit: '922337203685.4775807'})
        expect(tx.operations[0].line.equals(new Asset('USD', anotherAccount))).toBe(true)
    })

    it('queries only the Horizon server of the requested network', () => {
        //all mocked requests are rejected with an error if they target an unexpected Horizon origin
        expect(fetch.mock.calls.every(([req]) => new URL(req.url || req).origin === horizonOrigin)).toBe(true)
    })
})
