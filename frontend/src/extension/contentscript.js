import browser from 'webextension-polyfill'

function executeInPageContext({src, file}) {
    const script = document.createElement('script')
    if (src) {
        script.text = text
    }
    if (file) {
        script.src = browser.runtime.getURL(file)
    }
    script.onload = function () {
        this.remove()
    };
    (document.head || document.documentElement).appendChild(script)
}
//
/*browser.runtime.onMessage.addListener(function (request, sender) {
    //proxy messages from extension to the original caller window
    window.postMessage(request)
})*/

//capture it in the contentscript.js and pass to the rest of the extension
window.addEventListener('message', function (event) {
    //only accept messages from this window to itself [i.e. not from any iframes]
    if (event.source !== window) return
    if (!event.data.albedoExtensionRequest) return
    const {origin} = event.source
    // broadcasts it to rest of extension
    browser.runtime.sendMessage(event.data)
        .then(response => {
            window.postMessage(response, origin)
        })
}, false)

executeInPageContext({file: 'injected-albedo-intent.js'})