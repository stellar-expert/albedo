import EventEmitter from 'events'
import {DEVICE_CONNECT, DEVICE_DISCONNECT} from './adapters/adapter-events'
import {ACCOUNT_TYPES} from '../../state/account'
import LedgerAdapter from './adapters/ledger-adapter'
import TrezorAdapter from './adapters/trezor-adapter'

export default class HwSigner extends EventEmitter {
    constructor(accountType) {
        super()
        this.adapter = null
        switch (accountType) {
            case ACCOUNT_TYPES.LEDGER_ACCOUNT:
                this.setAdapter(LedgerAdapter)
                break
            case ACCOUNT_TYPES.TREZOR_ACCOUNT:
                this.setAdapter(TrezorAdapter)
                break
            default:
                throw new Error(`Unsupported hardware wallet type: ${accountType}.`)
        }
    }

    setAdapter(adapter) {
        if (this.adapter) {
            this.adapter.removeAllListeners()
        }

        this.adapter = adapter

        this.adapter.on(DEVICE_CONNECT, () => {
            this.emit(DEVICE_CONNECT)
        })
        this.adapter.on(DEVICE_DISCONNECT, () => {
            this.emit(DEVICE_CONNECT)
        })
    }

    async init(params) {
        return await this.adapter.init(params)
    }

    async getPublicKey(params) {
        if (this.adapter) {
            return await this.adapter.getPublicKey(params)
        } else {
            throw 'No adapter was set'
        }
    }

    async signTransaction(...args) {
        if (this.adapter) {
            return await this.adapter.signTransaction(...args)
        } else {
            throw 'No adapter was set'
        }
    }

    async signMessage(...args) {
        if (this.adapter) {
            return await this.adapter.signMessage(...args)
        } else {
            throw 'No adapter was set'
        }
    }

    async getDeviceId() {
        if (this.adapter) {
            return await this.adapter.getDeviceId()
        } else {
            throw 'No adapter was set'
        }
    }
}
