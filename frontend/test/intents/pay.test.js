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
    intent: 'pay',
    amount: '1',
    destination: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
}

describe('Intent - pay', () => {
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

    it('should be able to call a pay intent', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'pay',
            pubkey: publicKey,
            destination: fakeIntent.destination,
            network: 'public'
        })).toBeTruthy()

        const xdr = fakeWindow.getResults()[0].signed_envelope_xdr
        const transaction = TransactionBuilder.fromXdr(xdr, Networks.PUBLIC)
        expect(transaction.source).toBe(publicKey)
        expect(transaction.operations.length).toBe(1)
        expect(transaction.operations[0].type).toBe('payment')
        expect(transaction.operations[0].destination).toBe(fakeIntent.destination)
        expect(transaction.operations[0].asset.equals(Asset.native())).toBe(true)
        expect(transaction.operations[0].amount).toBe('1.0000000')
    })
})
