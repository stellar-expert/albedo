import { registerMessageListeners } from '../../src/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import { setupAccountManager, publicKey, privateKey } from '../util/fake-account-manager'
jest.mock('../../src/util/horizon-connector')

const fakeIntent = {
    intent: 'trust',
    asset_code: 'TST',
    asset_issuer: 'GCAJ43GPGOK5ZZ4QRCVZ6DNFCP2KCVDSPU72IUJRH5UTGERHSCELUG6B'
}

describe('Intent - trust', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to set up trustline', async () => {
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
            intent: 'trust',
            pubkey: 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2',
            asset_code: 'TST',
            asset_issuer: 'GCAJ43GPGOK5ZZ4QRCVZ6DNFCP2KCVDSPU72IUJRH5UTGERHSCELUG6B'
        })).toBeTruthy()
    })
})
