jest.mock('trezor-connect')
import TrezorConnect, {DEVICE_EVENT, DEVICE} from 'trezor-connect'
import {Keypair, Networks, Account, TransactionBuilder, Operation} from 'stellar-sdk'
import trezorAdapter from '../../../src/hw-signer/adapters/trezor-adapter'

const path = 'm/44\'/148\'/0\''
const publicKey = 'GARITBNKCUYWOYIUQWPARYLHYDYYKCYLLQZMX64LYEAMH3HKICGMKIVF'
const privateKey = 'SD3J53SQNMRVYLWGSKGZRJNLJAMKQKG3Y5NXI3O226QF3QUEUAXB3FDJ'

describe('TrezorAdapter', () => {

    it('should call manifest on init', async () => {
        await trezorAdapter.init({
            appManifest: {
                email: 'dev@stellar.expert',
                appUrl: 'https://stellar.expert'
            }
        })
        expect(TrezorConnect.manifest).toHaveBeenCalledWith({
            email: 'dev@stellar.expert',
            appUrl: 'https://stellar.expert'
        })
    })

    it('should call init on init', async () => {
        await trezorAdapter.init({
            appManifest: {
                email: 'dev@stellar.expert',
                appUrl: 'https://stellar.expert'
            }
        })
        expect(TrezorConnect.init).toHaveBeenCalled()
    })

    it('should listen on connect/disconnect events', async () => {
        await trezorAdapter.init({
            appManifest: {
                email: 'dev@stellar.expert',
                appUrl: 'https://stellar.expert'
            }
        })
        expect(TrezorConnect.on).toHaveBeenCalledWith(DEVICE_EVENT, expect.any(Function))
    })


    it('should call adapter method on signTransaction', async () => {
        await trezorAdapter.init({
            appManifest: {
                email: 'dev@stellar.expert',
                appUrl: 'https://stellar.expert'
            }
        })
        TrezorConnect.signMessage.mockImplementation(() => {
            return {
                success: true,
                payload: {
                    signature: 'random'
                }
            }
        })

        const destination = Keypair.random()
        const sourceAccount = new Account(publicKey, '0')
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: 100,
            networkPassphrase: Networks.TESTNET
        })
            .setTimeout(30)
            .addOperation(Operation.createAccount({
                destination: destination.publicKey(),
                startingBalance: '1'
            }))
            .build()

        await trezorAdapter.signTransaction({path, publicKey, transaction})
        expect(TrezorConnect.signMessage).toHaveBeenCalled()
    })

    it('should call stellarGetAddress method on getPublicKey', async () => {
        await trezorAdapter.init({
            appManifest: {
                email: 'dev@stellar.expert',
                appUrl: 'https://stellar.expert'
            }
        })
        TrezorConnect.stellarGetAddress.mockImplementation(() => {
            return {
                payload: {
                    address: 'random'
                }
            }
        })

        trezorAdapter.getPublicKey()
        expect(TrezorConnect.stellarGetAddress).toHaveBeenCalled()
    })
})
