/**
 * @jest-environment ./test/jsdom-environment.js
 */
import actionContext from '../../src/state/action-context'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager} from '../util/fake-account-manager'

it('debug', async () => {
    setupFakeWindow()
    setupFakeHorizon()
    registerMessageListeners(fakeWindow)
    const credentials = await setupAccountManager()
    await sendIntent({intent: 'sign_message', message: 'test message'})
    console.log('before confirm', actionContext.status, actionContext.intentErrors, actionContext.selectedAccount?.publicKey)
    await confirmRequest(credentials)
    console.log('after confirm', actionContext.status, String(actionContext.intentErrors), JSON.stringify(fakeWindow.getResults()))
})
