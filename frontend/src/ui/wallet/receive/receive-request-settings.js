import {makeAutoObservable} from 'mobx'
import {Networks} from '@stellar/stellar-base'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {isValidInt64Amount} from '@stellar-expert/formatter'
import {stringifyQuery} from '@stellar-expert/navigation'
import {encodeMuxedAccount} from '@stellar-expert/ui-framework'

export default class ReceiveRequestSettings {
    constructor(address, network) {
        this.address = address
        this.network = network
        this.asset = ['XLM']
        this.amount = ['0']
        makeAutoObservable(this)
    }

    address

    network

    asset

    amount

    memo

    invalidMemo = false

    encodeMuxedAddress = false

    setAmount(amount) {
        this.amount[0] = amount
    }

    setAsset(asset) {
        this.asset[0] = asset
    }

    toggleMuxed() {
        this.encodeMuxedAddress = !this.encodeMuxedAddress
    }

    generateSep7Link() {
        const args = {destination: this.address}
        if (isValidInt64Amount(this.amount[0], true, true)) {
            args.amount = this.amount[0].toString()
        }
        const asset = this.asset[0]
        if (asset && asset !== 'XLM') {
            const parsed = AssetDescriptor.parse(asset)
            args.asset_code = parsed.code
            args.asset_issuer = parsed.issuer
        }
        if (this.memo && !this.invalidMemo) {
            if (this.encodeMuxedAddress) {
                args.destination = encodeMuxedAccount(this.address, BigInt(this.memo.value))
            } else {
                args.memo = this.memo.value
                args.memo_type = this.memo.type
            }
        }
        if (this.network !== 'public') {
            args.network_passphrase = Networks[this.network.toUpperCase()]
        }

        return 'web+stellar:pay' + stringifyQuery(args)
    }
}