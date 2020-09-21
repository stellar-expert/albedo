class FrontendStub {
    postMessage(data) {
        const response = Object.assign({}, data)
        setTimeout(() => {
            this.callPostMessageHandler({ data: { albedoIntentResult: response } })
        }, 100)
    }

    close() {
    }

    notifyConnected() {
        this.callPostMessageHandler({ data: { albedo: {} } })
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
            removeEventListener: (e) => {},
            screenLeft: 0,
            screenTop: 0,
            innerWidth: 1280,
            innerHeight: 720
        }
        global.document = {
            createElement: () => {
                setTimeout(() => this.notifyConnected(), 200)
                return this
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