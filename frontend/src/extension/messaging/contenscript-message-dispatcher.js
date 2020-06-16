import browser from 'webextension-polyfill'

const extensionOrigin = new URL(browser.runtime.getURL('')).origin

const handlers = {}

/*browser.runtime.onMessage.addListener(function (request, sender) { })*/

window.addEventListener('message', function (event) {
    //only accept messages from this window to itself or from our extension [i.e. not from any iframes/other extensions]
    if (event.source !== window && event.origin !== extensionOrigin) return
    //each message must have a distinct type
    const {messageType} = event.data || {}
    if (!messageType) return
    const handler = handlers[messageType]
    if (!handler) {
        console.warn(`Unhandled message event type "${messageType}".`)
        return
    }
    handler(event.data, event.source)
}, false)

export const contentscriptMessageDispatcher = {
    listen(eventType, handler) {
        if (handlers[eventType]) throw new Error(`Handler for event ${eventType} has been defined already.`)
        handlers[eventType] = handler
    },
    sendToBackgroundPage(type, data) {
        return browser.runtime.sendMessage({
            ...data,
            messageType: type
        })
    },
    sendToWindow(data) {
        window.postMessage(data, window.origin)
    },
    proxyToBackgroundPage(type) {
        this.listen(type, (data, source) => {
            //allow requests only from the trusted origin
            if (source.origin !== albedoOrigin) return
            this.sendToBackgroundPage(type, data)
                .then(response => {
                    this.sendToWindow(response)
                })
        })
    }
}