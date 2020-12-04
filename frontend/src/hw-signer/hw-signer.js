import EventEmitter from 'events'
import {DEVICE_CONNECTED, DEVICE_DISCONNECTED} from './adapters/adapter-events'
import {ACCOUNT_TYPES} from '../state/account'
import LedgerAdapter from './adapters/ledger-adapter'

export default class HwSigner extends EventEmitter {
    constructor(accountType) {
        super()
        this.adapter = null
        switch (accountType) {
            case ACCOUNT_TYPES.LEDGER_ACCOUNT:
                this.setAdapter(LedgerAdapter)
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

        this.adapter.on(DEVICE_CONNECTED, () => {
            this.emit(DEVICE_CONNECTED)
        })
        this.adapter.on(DEVICE_DISCONNECTED, () => {
            this.emit(DEVICE_CONNECTED)
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
