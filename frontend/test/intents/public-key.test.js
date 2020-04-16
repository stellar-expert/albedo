import { registerMessageListeners } from '../../src/util/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import { setupAccountManager } from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'public_key'
}

describe.skip('Intent - public key', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to get public key', async () => {

    })
})
