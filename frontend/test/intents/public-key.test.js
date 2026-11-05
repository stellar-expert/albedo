/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {Keypair, hash, xdr} from '@stellar/stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'public_key',
    token: 'random-token'
}

describe('Intent - public key', () => {
    let credentials

    beforeAll(async () => {
        setupFakeWindow()
        setupFakeHorizon()
        registerMessageListeners(fakeWindow)
        credentials = await setupAccountManager()
    })

    afterAll(() => {
        fakeWindow.reset()
        jest.restoreAllMocks()
    })

    it('should be able to get public key', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'public_key',
            pubkey: publicKey,
            signed_message: `${publicKey}:random-token`
        })).toBeTruthy()
        //the token signature proves the account ownership
        const {signed_message, signature} = fakeWindow.getResults()[0]
        expect(Keypair.fromPublicKey(publicKey).verify(hash(signed_message), xdr.decodeBytes(signature, 'hex'))).toBe(true)
    })
})
