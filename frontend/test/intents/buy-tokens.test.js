import {Transaction, Asset} from '@stellar/stellar-base'

import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import {setupAccountManager, publicKey, privateKey} from '../util/fake-account-manager'

jest.mock('../../src/util/horizon-connector')

const fakeIntent = {
    intent: 'exchange',
    max_price: '1',
    amount: '1',
    buy_asset_code: 'FGF',
    buy_asset_issuer: 'GBCE2X2MXK52DFODYRQ3X5A45XMCKNZCCHH7MTFIFSRLCZNMIE4A4K5N'
}

describe('Intent - buy tokens', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to call basic info intent', async () => {
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: '*',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toBeNull()
        expect(fakeWindow.__history.push).toHaveBeenCalledWith('/confirm')

        await actionContext.confirmRequest()

        //expect(actionContext.intentErrors).toBeNull()
        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'exchange',
            pubkey: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
        })).toBeTruthy()

        const xdr = fakeWindow.getResults()[0].signed_envelope_xdr
        const transaction = new Transaction(xdr)
        const asset = new Asset(fakeIntent.buy_asset_code, fakeIntent.buy_asset_issuer)
        expect(transaction.source).toBe(publicKey)
        expect(transaction.operations.length).toBe(2)
        expect(transaction.operations[0].type).toBe('changeTrust')
        expect(transaction.operations[0].line).toStrictEqual(asset)
        expect(transaction.operations[1].type).toBe('pathPayment')
        expect(transaction.operations[1].destination).toBe('GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2')
        expect(transaction.operations[1].sendAsset).toStrictEqual(Asset.native())
        expect(transaction.operations[1].destAsset).toStrictEqual(asset)
        expect(transaction.operations[1].sendMax).toBe('1.0000000')
        expect(transaction.operations[1].destAmount).toBe('1.0000000')
    })
})
