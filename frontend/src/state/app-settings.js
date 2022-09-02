import defaultConfig from '../../default-config'

const appSettings = Object.assign(defaultConfig, {
    walletConnect: {
        broker: walletConnectBroker
    },
    oneSignal: {
        appId: onesignalAppId,
        safariId: onesignalSafariId
    }
})

export default appSettings