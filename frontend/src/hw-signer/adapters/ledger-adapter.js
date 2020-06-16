import EventEmitter from 'events'
import Transport from '@ledgerhq/hw-transport-u2f'
import StellarApp from '@ledgerhq/hw-app-str'
import {Keypair, xdr} from 'stellar-sdk'
import standardErrors from '../../util/errors'
import {DEVICE_CONNECTED, DEVICE_DISCONNECTED} from './adapter-events'
import {extractDeviceId} from '../../util/device-id-generator'

function normalizePath(path) {
    if (path.indexOf('m/') === 0) return path.substr(2)
    return path
}

let initialized = false

class LedgerAdapter extends EventEmitter {
    constructor() {
        super()

        this.transport = null
        this.stellarApp = null
    }

    async init({exchangeTimeout}) {
        if (!initialized) {
            await this.createTransport({exchangeTimeout})
            initialized = true
        }
        return this
    }

    async createTransport({exchangeTimeout}) {
        this.transport = await Transport.create()
        this.transport.setExchangeTimeout(exchangeTimeout || 20000)
        this.transport.on('disconnect', () => this.emit(DEVICE_DISCONNECTED))
        this.stellarApp = new StellarApp(this.transport)
    }

    async getPublicKey({path}) {
        return (await this.stellarApp.getPublicKey(normalizePath(path))).publicKey
    }

    async signTransaction({path, publicKey, transaction}) {
        const response = await this.stellarApp.signTransaction(normalizePath(path), transaction.signatureBase())
        const keyPair = Keypair.fromPublicKey(publicKey)
        const hint = keyPair.signatureHint()
        const decorated = new xdr.DecoratedSignature({hint: hint, signature: response.signature})
        transaction.signatures.push(decorated)
        return transaction
    }

    async signMessage({path, publicKey, message}) {
        try {
            const {signature} = await this.stellarApp.signHash(normalizePath(path), message)
            return signature
        } catch (e) {
            if (e.message === 'Hash signing not allowed. Have you enabled it in the app settings?') {
                throw standardErrors.hashSigningNotAllowed
            }
            throw e
        }
    }

    async getDeviceId() {
        // derive id from from the default bip44 path pubkey
        const pubkey = await this.getPublicKey({path: `m/44'/148'/0'`})
        return extractDeviceId(pubkey)
    }
}

export default new LedgerAdapter()