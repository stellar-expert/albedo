import { registerMessageListeners } from '../../src/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import { setupAccountManager } from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'basic_info'
}

describe('Intent - basic info', () => {
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

        expect(actionContext.intentErrors).toBeNull()
        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'basic_info',
            pubkey: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
            //signature:
        })).toBeTruthy()
    })
})
