/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {Keypair, xdr} from '@stellar/stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'sign_message',
    message: 'test message'
}

describe('Intent - sign message', () => {
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

    it('should be able to sign message', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'sign_message',
            message: 'test message',
            pubkey: publicKey,
            signed_message: `${publicKey}:test message`,
            //ed25519 signature of sha256(signed_message)
            message_signature: '18ddda7e6493c5c9c59bbfcf717bc988854a59027003c9ae1a6031285830505d29c202e4457766176be8217e2cfafba40a8a8fff30807d477e8437c7475c9209'
        })).toBeTruthy()
        //SEP-53 signature
        const {signedMessage} = fakeWindow.getResults()[0]
        expect(Keypair.fromPublicKey(publicKey).verifyMessage('test message', xdr.decodeBytes(signedMessage, 'hex'))).toBe(true)
    })
})
