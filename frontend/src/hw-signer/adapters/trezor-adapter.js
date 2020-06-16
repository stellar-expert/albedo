import EventEmitter from 'events'
import TrezorConnect, {DEVICE_EVENT, DEVICE} from 'trezor-connect'
import {Keypair, xdr} from 'stellar-sdk'
import {DEVICE_CONNECTED, DEVICE_DISCONNECTED} from './adapter-events'
import standardErrors from '../../util/errors'

let initialized = false

class TrezorAdapter extends EventEmitter {
    constructor() {
        super()
    }

    async init({appManifest}) {
        if (!initialized) {
            TrezorConnect.manifest(appManifest)
            await TrezorConnect.init()

            TrezorConnect.on(DEVICE_EVENT, (event) => {
                if (event.type === DEVICE.CONNECT) {
                    this.emit(DEVICE_CONNECTED)
                } else if (event.type === DEVICE.DISCONNECT) {
                    this.emit(DEVICE_DISCONNECTED)
                }
            })
            initialized = true
        }
        return this
    }

    async getPublicKey(params) {
        const response = await TrezorConnect.stellarGetAddress(params)
        if (response.success) {
            return response.payload.address
        } else {
            throw response.payload.error
        }
    }

    async signTransaction({path, publicKey, transaction}) {
        const response = await TrezorConnect.signMessage({
            path,
            message: transaction.hash().toString()
        })

        if (response.success) {
            const keyPair = Keypair.fromPublicKey(publicKey)
            const hint = keyPair.signatureHint()
            const decorated = new xdr.DecoratedSignature({hint: hint, signature: response.payload.signature})
            transaction.signatures.push(decorated)
            return transaction
        } else {
            throw response.payload.error
        }
    }

    async signMessage({path, publicKey, message}) {
        try {
            const {success, payload} = await TrezorConnect.signMessage({
                path,
                message: message.toString('hex'),
                hex: true
            })
            if (!success) {
                console.error(payload.error)
                throw standardErrors.messageSigningFailed
            }
            return payload.signature
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async getDeviceId() {
        const response = await TrezorConnect.getFeatures()

        if (!response.success) throw response.payload.error
        return response.payload.device_id
    }
}

export default new TrezorAdapter()
