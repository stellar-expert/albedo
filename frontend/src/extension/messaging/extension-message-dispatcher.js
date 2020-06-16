import browser from 'webextension-polyfill'

const handlers = {}

browser.runtime.onMessage.addListener(function (request, sender) {
    //ignore messages sent from other extensions and unrelated messages
    if ((!sender.tab && sender.id !== browser.runtime.id) || !request) return
    //each message must have a distinct type
    const {messageType} = request
    if (!messageType) return
    const handler = handlers[messageType]
    if (!handler) {
        console.warn(`Unhandled message event type "${messageType}".`)
        return
    }
    const res = handler(request, sender)
    if (res instanceof Promise) {
        return res.catch(e => {
            if (!e.error || !e.error.code) {
                console.error(e)
                e = {
                    error: {
                        code: -1,
                        message: 'Unhandled error occurred. If this error persists, please contact our support team.'
                    }
                }
            }
            return e
        })
    }
    return res

})

export const extensionMessageDispatcher = {
    listen(eventType, handler) {
        if (handlers[eventType]) throw new Error(`Handler for event ${eventType} has been defined already.`)
        handlers[eventType] = handler
    }
}