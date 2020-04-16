import {observable, action, computed, runInAction} from 'mobx'
import {StellarTomlResolver} from 'stellar-sdk'
import {createHorizon} from '../util/horizon-connector.js'
import errors from '../util/errors'
import dashboardSettings from './dashboard-settings.js'

class AssetInfo {
    code

    issuer

    @observable
    domain

    @computed
    get displayName() {
        if (!this.issuer) return 'XLM'
        if (!this.domain) return `${this.code}-${this.issuer.substr(0, 4) + '…' + this.issuer.substr(-4)}`
        return `${this.code} ${this.domain}`
    }

    @action
    sync() {
        const horizon = createHorizon({network: dashboardSettings.currentNetwork})
        horizon.loadAccount(this.issuer)
            .then(issuerAccountInfo => {
                const {home_domain} = issuerAccountInfo
                if (!home_domain) return issuerAccountInfo
                return StellarTomlResolver.resolve(issuerAccountInfo.home_domain)
                    .then(stellarToml => {
                        if (stellarToml?.CURRENCIES?.find(({code, issuer}) => code === this.code && issuer === this.issuer)) {
                            runInAction(() => {
                                this.domain = home_domain
                            })
                        }
                    })
                    .catch(e => {
                        console.error(e)
                    })
                    .then(() => issuerAccountInfo)
            })
    }
}

export default AssetInfo