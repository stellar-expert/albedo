jest.mock('@ledgerhq/hw-transport-webusb')
jest.mock('@ledgerhq/hw-app-str')
import {Keypair, Networks, Account, TransactionBuilder, Operation} from '@stellar/stellar-base'
import Transport from '@ledgerhq/hw-transport-webusb'
import StellarApp from '@ledgerhq/hw-app-str'
import appSettings from '../../../src/state/app-settings'

import ledgerAdapter from '../../../src/hw-signer/adapters/ledger-adapter'

const {appManifest} = appSettings
const path = `44'/148'/0'`
const publicKey = 'GARITBNKCUYWOYIUQWPARYLHYDYYKCYLLQZMX64LYEAMH3HKICGMKIVF'

Transport.create.mockImplementation(() => {
    return {
        setExchangeTimeout: jest.fn(),
        on: jest.fn()
    }
})

StellarApp.mockImplementation(() => {
    return {
        getPublicKey: jest.fn().mockImplementation(() => {
            return {
                publicKey: 'random'
            }
        }),
        signTransaction: jest.fn().mockImplementation(() => {
            return {
                result: {
                    signature: 'random'
                }
            }
        })
    }
})

describe('LedgerAdapter', () => {
    it('should create transport on init', async () => {
        await ledgerAdapter.init({appManifest})
        expect(ledgerAdapter.transport).not.toBeNull()
        expect(ledgerAdapter.stellarApp).not.toBeNull()
        expect(ledgerAdapter.transport.setExchangeTimeout).toHaveBeenCalledWith(20000)
        expect(ledgerAdapter.transport.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    })

    it('should call getPublicKey method on getPublicKey', async () => {
        await ledgerAdapter.init({appManifest})
        await ledgerAdapter.getPublicKey({
            path
        })
        expect(ledgerAdapter.stellarApp.getPublicKey).toHaveBeenCalled()
    })

    it('should call signHash method on signTransaction', async () => {
        await ledgerAdapter.init({appManifest})

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
        await ledgerAdapter.signTransaction({path, publicKey, transaction})
        expect(ledgerAdapter.stellarApp.signTransaction).toHaveBeenCalled()
    })
})
