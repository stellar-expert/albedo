const {TestEnvironment} = require('jest-environment-jsdom')

/**
 * jsdom test environment extended with browser APIs that jsdom doesn't implement
 */
class BrowserTestEnvironment extends TestEnvironment {
    async setup() {
        await super.setup()
        //binary data created by Node's TextEncoder should pass `instanceof Uint8Array` checks inside tests
        Object.assign(this.global, {TextEncoder, TextDecoder, Uint8Array, ArrayBuffer})
    }
}

module.exports = BrowserTestEnvironment
