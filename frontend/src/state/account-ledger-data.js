import {observable, action, runInAction} from 'mobx'
import errors from '../util/errors'
import {createHorizon} from '../util/horizon-connector'
import dashboardSettings from './dashboard-settings'

class AccountLedgerData {
    constructor(address) {
        this.address = address
    }

    address

    @observable
    loaded

    @observable
    nonExisting

    @observable
    balances

    @action
    sync() {
        const horizon = createHorizon({network: dashboardSettings.currentNetwork})
        return horizon.loadAccount(this.address)
            .then(issuerAccountInfo => {
                this.balances = issuerAccountInfo.balances
                this.loaded = true
            })
            .catch(e => {
                if (e.name === 'NotFoundError') {
                    runInAction(() => {
                        this.nonExisting = true
                        this.loaded = true
                    })
                    return Promise.resolve(e)
                } else {
                    console.error(e)
                }
            })
    }
}

export default AccountLedgerData