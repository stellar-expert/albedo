import intentInterface from '../src/intent-interface'

class FrontendStub {
    postMessage(data) {
        const intent = intentInterface[data.intent]
        const result = Object.assign({}, data)
        for (const prop of intent.returns)
            result[prop] = `${prop}Value`
        setTimeout(() => {
            this.callPostMessageHandler({data: {albedoIntentResult: result}})
        }, 100)
    }

    close() {
    }

    notifyConnected() {
        this.callPostMessageHandler({data: {albedo: {}}})
    }

    setup() {
        global.window = {
            open: () => {
                setTimeout(() => this.notifyConnected(), 200)
                return this
            },
            addEventListener: (event, handler) => {
                if (event !== 'message') throw new Error('Unsupported event: ' + event)
                this.callPostMessageHandler = handler
            },
            removeEventListener: (e) => {
                this.callPostMessageHandler = null
            },
            sessionStorage: {
                __items: {},
                setItem: function (key, value) {
                    this.__items[key] = value
                }
            },
            screenLeft: 0,
            screenTop: 0,
            innerWidth: 1280,
            innerHeight: 720
        }
        global.document = {
            createElement: (tag) => {
                setTimeout(() => this.notifyConnected(), 200)
                switch (tag) {
                    case 'iframe':
                        return {style: {}, contentWindow: null}
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