import {contentscriptMessageDispatcher as dispatcher} from './messaging/contenscript-message-dispatcher'
import browser from './browser'

function executeInPageContext({source, file}) {
    const script = document.createElement('script')
    if (source) {
        script.text = source
    }
    if (file) {
        script.src = browser.runtime.getURL(file)
    }
    script.onload = function () {
        this.remove()
    };
    (document.head || document.documentElement).appendChild(script)
}

dispatcher.proxyToBackgroundPage('get-stored-credentials')
dispatcher.proxyToBackgroundPage('save-stored-credentials')

window.sessionStorage && window.sessionStorage.setItem('albedoExtensionInstalled', '1')

dispatcher.sendToBackgroundPage('is-blocked', {domain: window.location.hostname})
    .then(res => {
        if (res.blocked)
            window.location.href = `${albedoOrigin}/blocked?from=${encodeURIComponent(window.location.hostname)}`
    })