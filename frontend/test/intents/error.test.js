/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent} from '../util/intent-flow'

/**
 * Get the error returned to the caller application for the last intent request
 * @return {{message: String, code: Number, ext: String}}
 */
function getReturnedError() {
    return fakeWindow.getResults().at(-1).error
}

describe('Intent - error handling', () => {
    beforeAll(() => {
        setupFakeWindow()
        setupFakeHorizon()
        registerMessageListeners(fakeWindow)
    })

    afterEach(() => {
        fakeWindow.reset()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    it('should return error on wrong intent passed', async () => {
        await sendIntent({intent: 'no_intent'})

        expect(getReturnedError()).toMatchObject({code: -3, ext: 'Unknown intent "no_intent".'})
    })

    it('should return errors on implicit_flow', async () => {
        await sendIntent({intent: 'implicit_flow', intents: []})

        expect(getReturnedError()).toMatchObject({code: -3, ext: 'No intents were specified for the implicit mode.'})

        await sendIntent({intent: 'implicit_flow', intents: ['not_existing_intent']})

        expect(getReturnedError()).toMatchObject({code: -3, ext: 'Unknown intent requested: "not_existing_intent".'})
    })

    it('should check for required params', async () => {
        await sendIntent({intent: 'pay'})

        expect(getReturnedError()).toMatchObject({code: -3, ext: 'Parameter "amount" is required.'})
    })
})
