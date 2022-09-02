const chainsMapping = {
    'stellar:pubnet': 'public',
    'stellar:testnet': 'testnet'
}

const methodsMapping = {
    'stellar_signAndSubmitXDR': 'Sign and submit transactions',
    'stellar_signXDR': 'Sign transactions'
}

export default class WcRequestParser {
    constructor(request) {
        this.request = request
        this.result = {}
        this.error = null
    }

    processRequest() {
        this.execute(this.parseGeneralParams)
        this.execute(this.parseMeta)
        this.execute(this.parsePairingRequest)
        this.execute(this.parseTxRequest)

        return this.error ? this.error : this.result
    }

    /**
     * @return {WcRequestParser}
     * @private
     */
    execute(method) {
        if (!this.error) {
            method.call(this)
        }
        return this
    }

    /**
     * @private
     */
    parsePairingRequest() {
        if (this.request.method !== 'pair')
            return
        this.result.method = this.request.method
        const permissions = this.request.permissions?.stellar
        if (!permissions.chains?.length || !permissions.methods?.length)
            return 'Missing pairing request permissions'

        const methods = []
        for (const method of permissions.methods) {
            const match = methodsMapping[method]
            if (!match)
                return 'Unknown permission: ' + method
            methods.push(match)
        }
        this.result.methods = methods

        const networks = []
        for (const chain of permissions.chains) {
            const match = chainsMapping[chain]
            if (!match)
                return 'Unknown Stellar network: ' + chain
            networks.push(match)
        }
        this.result.networks = networks
    }

    /**
     * @private
     */
    parseTxRequest() {
        if (!['stellar_signXDR', 'stellar_signAndSubmitXDR'].includes(this.request.method))
            return
        this.result.method = 'tx'
        if (this.request.method === 'stellar_signAndSubmitXDR') {
            this.result.submit = true
        }
        if (!this.request.xdr)
            return 'Transaction XDR is missing'
        this.result.xdr = this.request.xdr
        this.result.network = chainsMapping[this.request.chainId]
        if (!this.result.network)
            return 'Unknown Stellar network: ' + this.request.chainId

    }

    /**
     * @private
     */
    parseMeta() {
        const meta = {}
        const {metadata} = this.request
        if (!metadata)
            return 'Application metadata is missing'
        if (!metadata.name)
            return 'Application name is missing'
        meta.name = metadata.name
        if (!metadata.url)
            return 'Application website is missing'
        meta.url = metadata.url
        if (!metadata.icons?.length)
            return 'Application icon is missing'
        meta.icon = metadata.icons[0]
        this.result.meta = meta
    }

    /**
     * @private
     */
    parseGeneralParams() {
        if (!this.request || !this.request.metadata)
            return 'Malformed request'

        if ((this.request.expiration || 0) < new Date().getTime() - 10000)
            return 'Request expired. It should be valid for at least 10 seconds.'
        this.result.expires = this.request.expiration
        this.result.id = this.request.id
        this.result.pubkey = this.request.pubkey
    }
}