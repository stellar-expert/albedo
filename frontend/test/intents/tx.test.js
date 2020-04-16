import { registerMessageListeners } from '../../src/util/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'
import { setupAccountManager } from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'tx',
    xdr: 'AAAAALKsITwIgj06xq7bwjcmyk1B8u0f+bjIbmtkQwOEsTUOAAAAZAAUf1oAAAABAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAsqwhPAiCPTrGrtvCNybKTUHy7R/5uMhua2RDA4SxNQ4AAAAAAAAAAACYloAAAAAAAAAAAA=='
}

describe.skip('Intent - tx', () => {
    beforeAll(async () => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to call tx intent', async () => {

    })
})
