import {makeObservable, action, observable, runInAction} from 'mobx'
import walletConnectAdapter from '../ui/wallet-connect/wallet-connect-adapter'

class WcSessions {
    constructor() {
        makeObservable(this, {
            sessions: observable,
            fetch: action,
            unpair: action
        })
    }

    /**
     * @type {{}[]}
     */
    sessions

    /**
     * Fetch sessions from the server
     */
    fetch() {
        walletConnectAdapter.loadSessions()
            .then(res => runInAction(() => {
                this.sessions = res
            }))
    }

    /**
     * Unpair connected application
     * @param {String} sessionId
     */
    unpair(sessionId) {
        const idx = this.sessions.findIndex(r => r.id === sessionId)
        if (idx >= 0) {
            this.sessions.splice(idx, 1)
        }
    }
}

const wcSessions = new WcSessions()

export default wcSessions