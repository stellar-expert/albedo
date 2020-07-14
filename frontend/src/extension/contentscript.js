import browser from 'webextension-polyfill'
import {contentscriptMessageDispatcher} from './messaging/contenscript-message-dispatcher'

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

contentscriptMessageDispatcher.proxyToBackgroundPage('get-stored-credentials')
contentscriptMessageDispatcher.proxyToBackgroundPage('save-stored-credentials')

document.head.setAttribute('albedoExtensionInstalled', '1')
/*browser.tabs.executeScript({
    code: 'window.albedoExtensionInstalled = true'
});*/
//executeInPageContext({source: 'window.albedoExtensionInstalled = true'})