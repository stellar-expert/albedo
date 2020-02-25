import {setupFakeArgon2} from '../util/fake-argon2'
import {Transaction, Asset} from 'stellar-sdk'
import {registerMessageListeners} from '../../src/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

setupFakeArgon2()
jest.mock('../../src/util/horizon-connector')

const fakeIntent = {
    intent: 'pay',
    amount: '1',
    destination: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
}

describe('Intent - pay', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to call a pay intent', async () => {
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: '*',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toBeNull()
        //expect(fakeWindow.__history.push).toHaveBeenCalledWith('/confirm')

        await actionContext.confirmRequest()

        //expect(actionContext.intentErrors).toBeNull()
        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'pay',
            pubkey: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2',
            destination: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
        })).toBeTruthy()

        const xdr = fakeWindow.getResults()[0].signed_envelope_xdr
        const transaction = new Transaction(xdr)
        expect(transaction.source).toBe(publicKey)
        expect(transaction.operations.length).toBe(1)
        expect(transaction.operations[0].type).toBe('payment')
        expect(transaction.operations[0].destination).toBe(fakeIntent.destination)
        expect(transaction.operations[0].asset).toStrictEqual(Asset.native())
        expect(transaction.operations[0].amount).toBe('1.0000000')
    })
})
