import {observable} from 'mobx'

//TODO: move this settings to action context

const dashboardSettings = {
    @observable
    currentNetwork: 'testnet'//'public'
}

export default dashboardSettings