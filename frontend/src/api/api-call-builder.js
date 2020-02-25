import {signMessage} from '../util/crypto-utils'
import appSettings from '../app-settings'

class ApiCallBuilder {
    constructor(endpoint) {
        if (typeof endpoint !== 'string') throw new TypeError('Invalid API endpoint.')
        this.#endpoint = endpoint
        this.#headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }

    #frozen = false
    #endpoint = null
    #method = 'GET'
    #payload = null
    #signature = null
    #headers = null

    #checkNotFrozen() {
        if (this.#frozen) throw new Error('The ApiCallBuilder can be used only once. Create a new instance of ApiCallBuilder.')
    }


    data(payload) {
        this.#checkNotFrozen()
        if (this.#signature) throw new Error('Cannot change payload after signing.')
        this.#payload = payload
        return this
    }

    /**
     * Authorize request with user credentials.
     * @param {Credentials} credentials - User credentials.
     * @returns {ApiCallBuilder}
     */
    authorize(credentials) {
        if (!credentials) throw new TypeError('Authorization requires valid credentials.')
        this.#checkNotFrozen()
        if (!this.#payload) {
            this.#payload = {}
        }
        const {encryptionKey, totp} = credentials
        if (totp) {
            this.#payload.totp = totp
        }
        const serializedPayload = JSON.stringify(this.#payload)
        this.#signature = signMessage(serializedPayload, encryptionKey)
        return this
    }

    get() {
        this.#checkNotFrozen()
        this.#method = 'GET'
        return this.execute()
    }

    post() {
        this.#checkNotFrozen()
        this.#method = 'POST'
        return this.execute()
    }

    put() {
        this.#checkNotFrozen()
        this.#method = 'PUT'
        return this.execute()
    }

    delete() {
        this.#checkNotFrozen()
        this.#method = 'DELETE'
        return this.execute()
    }

    //TODO: add totp-key based authorization
    execute() {
        this.#checkNotFrozen()
        if (this.#signature) {
            this.#headers.Authorization = 'ED25519 ' + this.#signature
        }

        this.#frozen = true

        const params = {
            method: this.#method || 'GET',
            headers: this.#headers
        }

        let url = `${appSettings.apiEndpoint}/api/${this.#endpoint}`
        const payload = this.#payload || {}
        if (this.#method === 'GET') {
            const queryString = Object.keys(payload)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`)
                .join('&')
            if (queryString) {
                url += '?' + queryString
            }
        } else {
            Object.assign(params, {
                body: JSON.stringify(payload)
            })
        }

        return fetch(url, params)
            .then(resp => {
                return resp.json()
                    .then(parsed => resp.ok ? parsed : Promise.reject(parsed))
            })
    }
}

export default ApiCallBuilder