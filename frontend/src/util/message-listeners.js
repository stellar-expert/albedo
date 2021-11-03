import {navigation} from '@stellar-expert/ui-framework'
import pkgInfo from '../../package.json'
import actionContext from '../state/action-context'
import accountManager from '../state/account-manager'
import stoplistTracker from '../stoplist/stoplist-tracker'
import {isInsideFrame} from './frame-utils'
import storageProvider from '../storage/storage-provider'

async function handleInternalCommand(data, origin) {
    if (data.sync) {
        for (let key of Object.keys(data.sync)) {
            await storageProvider.setItem(key, data.sync[key])
        }
        await accountManager.reload()
        return true
    }
    return false
}

async function handleIntentRequest(data, origin) {
    data.app_origin = origin || null
    await actionContext.setContext(data)

    if (actionContext.intent === 'manage_account') {
        navigation.navigate('/account')
        return
    }

    if (!actionContext.isImplicitIntent) {
        //interactive flow
        navigation.navigate('/confirm')
        return
    }
    try {
        //implicit flow
        await actionContext.confirmRequest()
        if (actionContext.response) {
            await actionContext.finalize()
        }
    } catch (e) {
        await actionContext.rejectRequest(e)
    }
}

function notifyOpener() {
    setTimeout(() => {
        (window.opener || window.parent).postMessage({albedo: {version: pkgInfo.version}}, '*')
    }, 300)
}

export function registerMessageListeners(window) {
    window.addEventListener('message', async function ({data = {}, origin, source}) {
        const originDomain = new URL(origin).hostname
        if (await stoplistTracker.isDomainBlocked(originDomain)) {
            window.location = `${albedoOrigin}/blocked?from=${encodeURIComponent(originDomain)}`
            return
        }
        //synchronize localStorage inside iframe if requested during implicit request confirmation
        if (isInsideFrame() && origin === window.origin) {
            if (await handleInternalCommand(data, origin)) return
        }
        //TODO: we can store source in the actionContext to avoid possible source window disambiguation
        if (data.__albedo_intent_version && data.intent) {
            await handleIntentRequest(data, origin)
        }
    })
    notifyOpener()
}
