import {generateRandomToken} from './random-token-generator'
import intentErrors from './intent-errors'

/**
 * Create transport handler for a given window|iframe and establish communication channel.
 * @param {Window} targetWindow - Transport window|iframe reference.
 * @param {Boolean} ephemeral - If set to true, automatically closes the window opened after receiving the response.
 */
function TransportHandler(targetWindow, ephemeral = false) {
    this.windowHandler = targetWindow
    this.ephemeral = !!ephemeral
    this.isLoaded = false
    this.pendingRequests = {}
    this.preprocessRequestParams = null
    this.onLoaded = new Promise((resolve, reject) => this.onLoadedCallback = resolve).then(() => this)
    this.messageHandler = this.messageHandler.bind(this)
    window.addEventListener('message', this.messageHandler, false)
}

TransportHandler.prototype = {

    isLoaded: false,

    protocolVersion: 3,

    markLoaded() {
        const {onLoadedCallback} = this
        if (onLoadedCallback) {
            this.onLoadedCallback = null
            this.isLoaded = true
            onLoadedCallback()
        }
    },

    /**
     * Handler for incoming communication messages processing.
     * @param {Object} data - Received data.
     */
    messageHandler({data}) {
        if (data.albedo) {
            this.matchProtocolVersion(data.albedo.protocol)
            return this.markLoaded()
        }
        if (data.albedoIntentResult) {
            const {__reqid, ...result} = data.albedoIntentResult,
                pending = this.pendingRequests[__reqid]
            if (pending) {
                delete this.pendingRequests[__reqid]
                pending(result)
                if (this.ephemeral) {
                    window.removeEventListener('message', this.messageHandler, false)
                    this.windowHandler.close()
                }
            }
        }
    },

    /**
     * Handler for the transport window close event.
     */
    transportCloseHandler() {
        for (let key in this.pendingRequests)
            if (this.pendingRequests.hasOwnProperty(key)) {
                const pending = this.pendingRequests[key]
                delete this.pendingRequests[key]
                pending(intentErrors.actionRejectedByUser)
            }
    },

    /**
     * Request intent confirmation using current transport.
     * @param {Object} params - Intent request params.
     * @return {Promise}
     */
    postMessage(params) {
        const nonce = generateRandomToken()
        return new Promise((resolve, reject) => {
            this.onLoaded.then(() => {
                this.pendingRequests[nonce] = handleIntentResponsePromise.bind(this, resolve, reject)
                params = Object.assign({__reqid: nonce, __albedo_intent_version: this.protocolVersion}, params)
                if (this.preprocessRequestParams) {
                    params = this.preprocessRequestParams(params)
                }
                this.windowHandler.postMessage(params, '*')
            })
        })
    },

    /**
     * Check protocol version compatibility.
     * @param {Number} albedoProtocolVersion
     */
    matchProtocolVersion(albedoProtocolVersion) {
        const versionDif = albedoProtocolVersion - this.protocolVersion
        if (versionDif === 0) return //everything is good
        const error = `@albedo-link/intent module protocol version (${this.protocolVersion}) is incompatible with current Albedo protocol version ${albedoProtocolVersion}.`
        if (versionDif > 0) {
            console.warn(error + ' Please update @albedo-link/intent module to avoid possible connection problems.')
        } else if (versionDif < 0) {
            this.windowHandler.close()
            throw new Error(error)
        }
    }
}

function handleIntentResponsePromise(resolve, reject, res) {
    if (res.error) {
        reject(res)
    } else {
        resolve(res)
    }
}

export default TransportHandler
