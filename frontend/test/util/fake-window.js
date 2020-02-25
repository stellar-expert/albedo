let eventListenersFns = []
let postMessageResults = []

const fakeWindow = {
    addEventListener: (eventName, fn) => {
        eventListenersFns.push(fn)
    },
    opener: {
        postMessage: ({albedoIntentResult}) => {
            if (albedoIntentResult) {
                postMessageResults.push(albedoIntentResult)
            }
        }
    },
    checkIfExpectedResultReturned: (expectedResult) => {
        return !!postMessageResults.find(result => {
            for (const prop in expectedResult) {
                if (result[prop] !== expectedResult[prop]) return false
            }
            return true
        })
    },
    getResults: () => {
        return postMessageResults
    },
    callEventListenersWithParams: (params, callee) => {
        eventListenersFns.forEach(fn => fn.call(callee || this, params))
    },
    __history: {
        push: jest.fn()
    },
    fetch: jest.fn(),
    origin: 'https://stellar.expert',
    reset: () => {
        eventListenersFns = []
        postMessageResults = []
    }
}

function setupFakeWindow() {
    for (var prop in fakeWindow) {
        Object.defineProperty(global, prop, {value: fakeWindow[prop]})
    }
}

export {fakeWindow, setupFakeWindow}
