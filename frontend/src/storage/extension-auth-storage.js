import {extensionMessageDispatcher} from '../extension/messaging/extension-message-dispatcher'

const authStorage = {}

function saveCredentials({accountId, data, ts, ttl}) {
    if (!accountId) return
    authStorage[accountId] = {data, ts, ttl}
}

function isExpired({ts, ttl}) {
    return ts + ttl < new Date().getTime()
}

function getCredentials(accountId) {
    const val = authStorage[accountId]
    if (!val) return undefined
    if (isExpired(val)) {
        //cleanup if expired
        delete authStorage[accountId]
        return undefined
    }
    //reset timestamp to prolongate the expiration period
    val.ts = new Date().getTime()
    return val.data
}

//schedule a periodic auth data cleanup
setInterval(function () {
    for (const accountId of Object.keys(authStorage)) {
        const val = authStorage[accountId]
        //cleanup if expired
        if (val && isExpired(val)) {
            delete authStorage[accountId]
        }
    }
}, 60 * 1000) //cleanup every minute

export function initAuthStorage() {
    extensionMessageDispatcher.listen('save-stored-credentials', function (request) {
        saveCredentials(request)
        return Promise.resolve({saved: true})
    })
    extensionMessageDispatcher.listen('get-stored-credentials', function (request) {
        const credentials = getCredentials(request.accountId) || null
        return Promise.resolve({credentials, __reqid: request.__reqid})
    })

}