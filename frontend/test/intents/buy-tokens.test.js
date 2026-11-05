/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {TransactionBuilder, Networks, Asset} from '@stellar/stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'exchange',
    max_price: '1',
    amount: '1',
    buy_asset_code: 'FGF',
    buy_asset_issuer: 'GBCE2X2MXK52DFODYRQ3X5A45XMCKNZCCHH7MTFIFSRLCZNMIE4A4K5N'
}

describe('Intent - buy tokens', () => {
    let credentials

    beforeAll(async () => {
        setupFakeWindow()
        setupFakeHorizon()
        registerMessageListeners(fakeWindow)
        credentials = await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to buy tokens', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'exchange',
            pubkey: publicKey
        })).toBeTruthy()

        const xdr = fakeWindow.getResults()[0].signed_envelope_xdr
        const transaction = TransactionBuilder.fromXdr(xdr, Networks.PUBLIC)
        const asset = new Asset(fakeIntent.buy_asset_code, fakeIntent.buy_asset_issuer)
        expect(transaction.source).toBe(publicKey)
        expect(transaction.operations.length).toBe(2)
        //the account doesn't have a trustline yet
        expect(transaction.operations[0].type).toBe('changeTrust')
        expect(transaction.operations[0].line.equals(asset)).toBe(true)
        expect(transaction.operations[1].type).toBe('pathPaymentStrictReceive')
        expect(transaction.operations[1].destination).toBe(publicKey)
        expect(transaction.operations[1].sendAsset.equals(Asset.native())).toBe(true)
        expect(transaction.operations[1].destAsset.equals(asset)).toBe(true)
        expect(transaction.operations[1].sendMax).toBe('1.0000000')
        expect(transaction.operations[1].destAmount).toBe('1.0000000')
    })
})
