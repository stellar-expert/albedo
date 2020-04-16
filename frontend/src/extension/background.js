import browser from 'webextension-polyfill'
import {openDialogWindow} from '../util/dialog-window'
import {scheduleCleanupExpiredSessions} from '../storage/session-storage'
import actionContext from '../state/action-context'
import standardErrors from '../util/errors'

function openExtensionUi() {
    let extensionURL = browser.runtime.getURL('popup.html')
    browser.tabs.create({url: extensionURL})
}

/*
browser.runtime.onInstalled.addListener(e => {
    if (process.env.DEBUG || process.env.TEST) return
    if (e.reason === 'install') {
        //openExtensionUi()
    }
})*/

function handleImplicitSessionRequest() {
    return actionContext.confirmRequest()
        .then(res => {
            return {albedoIntentResult: res}
        })
        .catch(e => actionContext.rejectRequest(e))
}

function handleInteractiveFlowRequest(requestData) {
    return new Promise(resolve => {
        const dialog = openDialogWindow(browser.runtime.getURL('popup.html'))
        const messageHandler = function ({source, data}) {
            if (source !== dialog) return
            if (data.albedo) {
                //popup window signals ready state - now we can send a payload
                dialog.postMessage(requestData, '*')
                return
            }
            window.removeEventListener('message', messageHandler, false)
            dialog.close()
            resolve(data)
        }
        window.addEventListener('message', messageHandler, false)
    })
}

browser.runtime.onMessage.addListener(function (request, sender) {
    const data = request.albedoExtensionRequest
    //ignore messages sent from other extensions and unrelated messages
    if (!sender.tab || !data) return
    data.app_origin = (new URL(sender.tab.url)).origin

    return actionContext.setContext(data)
        .then(() => {
            if (actionContext.isImplicitIntent)
                //implicit flow
                return handleImplicitSessionRequest()
            //interactive flow
            return handleInteractiveFlowRequest(data)
        })
        .catch(e => {
            if (!e.error || !e.error.code) {
                console.error(e)
                e = {error: standardErrors.unhandledError(e)}
            }
            return Promise.resolve({albedoIntentResult: e})
        })
})

//TODO: automatically log-out after 1 hours of inactivity - introduce corresponding settings