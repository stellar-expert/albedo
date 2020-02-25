if (typeof window === 'undefined') {
    global.chai = require('chai')
    //global.chai.use(require('chai-as-promised'))
    global.sinon = require('sinon')
    global.expect = global.chai.expect
}
