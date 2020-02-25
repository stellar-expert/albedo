import {generateRandomToken} from './random-token-generator'
import intentErrors from './intent-errors'

class TransportHandler {
    /**
     * Create transport handler for a given window|iframe and establish communication channel.
     * @param {Window} targetWindow - Transport window|iframe reference.
     * @param {Boolean} isIframeTransport - Keeps transport window open after receiving the response.
     */
    constructor(targetWindow, isIframeTransport = false) {
        this.windowHandler = targetWindow
        this.isIframeTransport = !!isIframeTransport
        this.isLoaded = false
        this.pendingRequests = {}
        this.onLoaded = new Promise((resolve, reject) => this.onLoadedCallback = resolve)
        this.messageHandler = this.messageHandler.bind(this)
        window.addEventListener('message', this.messageHandler, false)
    }

    isLoaded = false

    /**
     * Handler for incoming communication messages processing.
     * @param {Object} data - Received data.
     */
    messageHandler({data}) {
        if (data.albedo) {
            const {version} = data.albedo
            //TODO: check version compatibility
            this.isLoaded = true
            if (this.onLoadedCallback) {
                const onTransportWindowLoaded = this.onLoadedCallback
                this.onLoadedCallback = null
                onTransportWindowLoaded()
            }
            return
        }
        if (data.albedoIntentResult) {
            const {__reqid, ...result} = data.albedoIntentResult,
                pending = this.pendingRequests[__reqid]
            if (pending) {
                delete this.pendingRequests[__reqid]
                pending(result.error, result)
                if (!this.isIframeTransport) {
                    window.removeEventListener('message', this.messageHandler, false)
                    this.windowHandler.close()
                }
            }
        }
    }

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
    }

    /**
     * Request intent confirmation using current transport.
     * @param {Object} params - Intent request params.
     * @return {Promise}
     */
    postMessage(params) {
        const nonce = generateRandomToken()
        return new Promise((resolve, reject) => {
            this.onLoaded.then(() => {
                this.pendingRequests[nonce] = (err, data) => err ? reject(err) : resolve(data)
                this.windowHandler.postMessage(Object.assign({__reqid: nonce}, params), '*')
            })
        })
    }
}

export default TransportHandler
