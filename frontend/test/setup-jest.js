global.fetch = require('jest-fetch-mock')

//module-level cleanup intervals in the app should not keep the test process alive
const originalSetInterval = global.setInterval
global.setInterval = (...args) => {
    const timer = originalSetInterval(...args)
    timer.unref?.()
    return timer
}
