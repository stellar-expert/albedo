/**
 * @jest-environment ./test/jsdom-environment.js
 */
import {TransactionBuilder, Networks, Asset} from '@stellar/stellar-sdk'
import {navigation} from '@stellar-expert/ui-framework'
import {registerMessageListeners} from '../../src/util/message-listeners'
import {fakeWindow, setupFakeWindow} from '../util/fake-window'
import {setupFakeHorizon} from '../util/fake-horizon'
import {sendIntent, confirmRequest} from '../util/intent-flow'
import {setupAccountManager, publicKey} from '../util/fake-account-manager'

const fakeIntent = {
    intent: 'trust',
    asset_code: 'TST',
    asset_issuer: 'GCAJ43GPGOK5ZZ4QRCVZ6DNFCP2KCVDSPU72IUJRH5UTGERHSCELUG6B'
}

describe('Intent - trust', () => {
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

    it('should be able to set up trustline', async () => {
        await sendIntent(fakeIntent)

        expect(navigation.path).toEqual('/confirm')

        await confirmRequest(credentials)

        expect(fakeWindow.checkIfExpectedResultReturned({
            intent: 'trust',
            pubkey: publicKey,
            asset_code: 'TST',
            asset_issuer: 'GCAJ43GPGOK5ZZ4QRCVZ6DNFCP2KCVDSPU72IUJRH5UTGERHSCELUG6B'
        })).toBeTruthy()

        const xdr = fakeWindow.getResults()[0].signed_envelope_xdr
        const transaction = TransactionBuilder.fromXdr(xdr, Networks.PUBLIC)
        expect(transaction.source).toBe(publicKey)
        expect(transaction.operations.length).toBe(1)
        expect(transaction.operations[0].type).toBe('changeTrust')
        expect(transaction.operations[0].line.equals(new Asset(fakeIntent.asset_code, fakeIntent.asset_issuer))).toBe(true)
        expect(transaction.operations[0].limit).toBe('922337203685.4775807')
    })
})
