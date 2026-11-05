/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent} from '../util/intent-flow'
import {setupAccountManager} from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'basic_info'
}

describe('Intent - basic info', () => {
    beforeAll(async () => {
        setupFakeWindow()
        setupFakeHorizon()
        registerMessageListeners(fakeWindow)
        await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should reject basic info intent removed from the protocol', async () => {
        await sendIntent(fakeIntent)

        expect(fakeWindow.getResults()[0].error).toMatchObject({code: -3, ext: 'Unknown intent "basic_info".'})
    })
})
