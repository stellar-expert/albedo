import { registerMessageListeners } from '../../src/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import { setupAccountManager, publicKey, privateKey } from '../util/fake-account-manager'


const fakeIntent = {
    intent: 'sign_message',
    message: 'test message'
}

describe('Intent - sign message', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to sign message', async () => {
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

        expect(actionContext.intentErrors).toBeNull()
        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'sign_message',
            message: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2:test message',
            original_message: 'test message',
            message_signature: '2b074fad920f8594aab84b43f6e548695b7a4b55a871ebb4081e61544f6741906800b543f9629468c5376328ad62f8dca6feb7ae9430d5569d4e72510af8740c'
        })).toBeTruthy()
    })
})
