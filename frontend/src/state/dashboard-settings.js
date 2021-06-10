import {observable, makeAutoObservable} from 'mobx'

//TODO: move this settings to action context

class DashboardSettings {
    constructor() {
        makeAutoObservable(this, {currentNetwork: observable})
        this.currentNetwork = 'testnet'
    }

    currentNetwork = 'testnet'//'public'
}

const dashboardSettings = new DashboardSettings()
export default dashboardSettings