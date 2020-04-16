import { registerMessageListeners } from '../../src/util/message-listeners'
import { fakeWindow, setupFakeWindow } from '../util/fake-window'
import actionContext from '../../src/state/action-context'

let fakeIntent;

describe('Intent - error handling', () => {
    beforeEach(() => {
        setupFakeWindow()
        registerMessageListeners(fakeWindow)
        fakeIntent = {
            intent: null,
            intents: []
        }
    })

    afterEach(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should set error on wrong intent passed', () => {
        fakeIntent.intent = 'no_intent'
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: '*',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toMatch('Unknown intent "no_intent".')
    })

    it('should set errors on implicit_flow', () => {
        fakeIntent.intent = 'implicit_flow'
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: '*',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toMatch('Origin "*" is not allowed to request implicit flow permissions.')

        fakeIntent.intents.push('not_existing_intent')
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: 'https://stellar.expert',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toMatch('Unknown intent requested: "not_existing_intent".')
    })

    it('should check for requered params', () => {
        fakeIntent.intent = 'pay'
        fakeWindow.callEventListenersWithParams({
            data: {
                ...fakeIntent
            },
            origin: '*',
            source: '*'
        }, this)

        expect(actionContext.intentErrors).toMatch('Parameter "amount" is required')
    })
})
