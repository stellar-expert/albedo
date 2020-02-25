import EventEmitter from 'events'
import {ACCOUNT_TYPES} from '../../src/state/account'
import StellarSigner from '../../src/util/hw-signer/hw-signer'
import {DEVICE_CONNECT, DEVICE_DISCONNECT} from '../../src/util/hw-signer/adapters/adapter-events'

describe('Hardware Signer', () => {
    it('should be able to set adapter', () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.TREZOR_ACCOUNT)
        signer.setAdapter(new EventEmitter())
        expect(signer.adapter).not.toBeUndefined()
    })

    it('should set adapter to listen to device events', () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.TREZOR_ACCOUNT)
        const mockedAdapter = new EventEmitter()
        mockedAdapter.on = jest.fn().mockImplementation(() => mockedAdapter)
        mockedAdapter.off = jest.fn().mockImplementation(() => mockedAdapter)
        signer.setAdapter(mockedAdapter)

        expect(mockedAdapter.on).toHaveBeenNthCalledWith(1, DEVICE_CONNECT, expect.any(Function))
        expect(mockedAdapter.on).toHaveBeenNthCalledWith(2, DEVICE_DISCONNECT, expect.any(Function))
    })

    /*it('should deregister listeners on adapter re-set', () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.LEDGER_ACCOUNT)
        const mockedAdapter = new EventEmitter()
        mockedAdapter.off = jest.fn().mockImplementation(() => mockedAdapter)
        signer.setAdapter(mockedAdapter)
        signer.setAdapter(mockedAdapter)
        expect(mockedAdapter.off).toHaveBeenNthCalledWith(1, DEVICE_CONNECT)
        expect(mockedAdapter.off).toHaveBeenNthCalledWith(2, DEVICE_DISCONNECT)
    })*/

    it('should throw error on operation if adapter is not set', async () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.TREZOR_ACCOUNT)

        expect(signer.getPublicKey()).rejects.toMatch('No adapter was set')
        expect(signer.signTransaction()).rejects.toMatch('No adapter was set')
    })

    it('should call adapter method on getPublicKey', () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.TREZOR_ACCOUNT)
        const mockedAdapter = new EventEmitter()
        mockedAdapter.getPublicKey = jest.fn()
        signer.setAdapter(mockedAdapter)
        signer.getPublicKey()
        expect(mockedAdapter.getPublicKey).toHaveBeenCalled()
    })

    it('should call adapter method on signTransaction', () => {
        const signer = new StellarSigner(ACCOUNT_TYPES.TREZOR_ACCOUNT)
        const mockedAdapter = new EventEmitter()
        mockedAdapter.signTransaction = jest.fn()
        signer.setAdapter(mockedAdapter)
        signer.signTransaction()
        expect(mockedAdapter.signTransaction).toHaveBeenCalled()
    })
})
