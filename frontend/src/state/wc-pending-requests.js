import {makeObservable, action, observable, runInAction} from 'mobx'
import walletConnectAdapter from '../ui/wallet-connect/wallet-connect-adapter'

class WcPendingRequests {
    constructor() {
        this.requests = []
        makeObservable(this, {
            requests: observable,
            fetch: action,
            remove: action,
            cleanExpired: action
        })
    }

    /**
     * @type {{}[]}
     */
    requests

    /**
     * Fetch requests from the server
     */
    fetch() {
        return walletConnectAdapter.loadRequests()
            .then(res => runInAction(() => {
                this.requests = res
            }))
    }

    /**
     * Remove request from pending requests
     * @param {String} requestId
     */
    remove(requestId) {
        const idx = this.requests.findIndex(r => r.id === requestId)
        if (idx >= 0) {
            this.requests.splice(idx, 1)
        }
    }

    /**
     * @private
     */
    cleanExpired() {
        for (let i = 0; i < this.requests.length; i++) {
            const req = this.requests[i]
            if (req.expiration < new Date().getTime()) {
                this.requests.splice(i, 1)
                i--
            }
        }
    }
}

const wcPendingRequests = new WcPendingRequests()

export default wcPendingRequests