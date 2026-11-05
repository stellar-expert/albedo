/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {Account, Asset, Keypair, Networks, Operation, TransactionBuilder, xdr} from '@stellar/stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

const tx = new TransactionBuilder(new Account(publicKey, '1'), {fee: '100', networkPassphrase: Networks.PUBLIC})
    .addOperation(Operation.payment({destination: publicKey, asset: Asset.native(), amount: '1'}))
    .setTimeout(0)
    .build()

const fakeIntent = {
    intent: 'tx',
    xdr: tx.toXdr()
}

describe('Intent - tx', () => {
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

    it('should be able to call tx intent', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'tx',
            pubkey: publicKey,
            xdr: fakeIntent.xdr,
            tx_hash: xdr.encodeBytes(tx.hash(), 'hex')
        })).toBeTruthy()

        const signedTx = TransactionBuilder.fromXdr(fakeWindow.getResults()[0].signed_envelope_xdr, Networks.PUBLIC)
        expect(signedTx.toEnvelope().value.tx.equals(tx.toEnvelope().value.tx)).toBe(true)
        expect(signedTx.signatures.length).toBe(1)
        expect(Keypair.fromPublicKey(publicKey).verify(tx.hash(), signedTx.signatures[0].signature.toBytes())).toBe(true)
    })
})
