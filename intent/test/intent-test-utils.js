import intentInterface from '../src/intent-interface'

class SessionStorageStub {
    setItem(key, value) {
        this[key] = value
    }

    getItem(key) {
        return this[key]
    }

    removeItem(key) {
        if (this.hasOwnProperty(key)) {
            delete this[key]
        }
    }
}

class WindowStub {
    constructor() {
        this.sessionStorage = new SessionStorageStub()
    }

    sessionStorage
    screenLeft = 0
    screenTop = 0
    innerWidth = 1280
    innerHeight = 720
    onLoaded = Promise.resolve()

    open() {
        setTimeout(() => this.notifyConnected(), 50)
        return this
    }

    addEventListener(event, handler) {
        if (event !== 'message') throw new Error('Unsupported event: ' + event)
        this.callPostMessageHandler = handler
    }

    removeEventListener(e) {
        this.callPostMessageHandler = null
    }

    notifyConnected() {
        this.callPostMessageHandler({data: {albedo: {}}})
    }

    postMessage(data) {
        const intent = intentInterface[data.intent]
        const result = Object.assign({}, data)
        for (const prop of intent.returns)
            result[prop] = `${prop}Value`
        setTimeout(() => {
            this.callPostMessageHandler({data: {albedoIntentResult: result}})
        }, 50)
    }

    close() {
    }
}

class FrontendStub {
    setup() {
        global.window = new WindowStub()
        global.document = {
            createElement: (tag) => {
                switch (tag) {
                    case 'iframe':
                        return {style: {}, contentWindow: new WindowStub()}
                }
            },
            body: {
                appendChild: function () {
                }
            }
        }
    }

    destroy() {
        global.window = undefined
        global.document = undefined
    }
}

export default new FrontendStub()