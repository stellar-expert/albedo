let eventListenersFns = []
let postMessageResults = []

//caller application window that receives intent results
const fakeOpener = {
    postMessage: ({albedoIntentResult}) => {
        if (albedoIntentResult) {
            postMessageResults.push(albedoIntentResult)
        }
    },
    frames: []
}

const fakeWindow = {
    origin: window.origin,
    location: window.location,
    addEventListener: (eventName, fn) => {
        if (eventName === 'message') {
            eventListenersFns.push(fn)
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
    /**
     * Deliver a message to registered listeners and wait until it's processed
     * @param {{data: Object, origin: String}} message
     * @return {Promise}
     */
    callEventListenersWithParams: (message) => {
        return Promise.all(eventListenersFns.map(fn => fn({source: fakeOpener, ...message})))
    },
    reset: () => {
        postMessageResults = []
    }
}

function setupFakeWindow() {
    Object.defineProperty(window, 'opener', {value: fakeOpener, configurable: true})
    //the app closes the window after the intent rejection (restored by jest.restoreAllMocks)
    jest.spyOn(window, 'close').mockImplementation(() => {})
}

export {fakeWindow, setupFakeWindow}
