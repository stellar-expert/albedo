import {initAuthStorage} from '../storage/extension-auth-storage'
import {extensionMessageDispatcher} from './messaging/extension-message-dispatcher'
import stoplistTracker from '../stoplist/stoplist-tracker'

initAuthStorage()

extensionMessageDispatcher.listen('is-blocked', function (request) {
    return stoplistTracker.isDomainBlocked(request.domain)
        .then(blocked => ({blocked}))
})

//TODO: introduce settings for the configurable activity period