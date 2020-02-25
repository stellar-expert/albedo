import {observable} from 'mobx'

class DemoNavModel {
    @observable
    section = ''
}

export default new DemoNavModel()