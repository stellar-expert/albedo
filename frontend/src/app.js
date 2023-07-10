import React from 'react'
import {render} from 'react-dom'
import {configure} from 'mobx'
import {setStellarNetwork, subscribeToStellarNetworkChange} from '@stellar-expert/ui-framework'
import {navigation, bindClickNavHandler} from '@stellar-expert/navigation'
import webPushNotificationsAdapter from './notifications/web-push-notifications-adapter'
import Router from './ui/app-router'
import {scheduleCleanupExpiredSessions} from './storage/implicit-session-storage'
import storageProvider from './storage/storage-provider'
import accountManager from './state/account-manager'
import {registerMessageListeners} from './util/message-listeners'
import {createNotificationContainer} from './ui/notifications/notifications'
import './ui/styles.scss'

window.explorerFrontendOrigin = 'https://stellar.expert'
window.explorerApiOrigin = 'https://api.stellar.expert'

configure({enforceActions: 'never'})

const appContainer = document.createElement('div')

//handle link clicks and navigation
bindClickNavHandler(appContainer)

//load active network from the saved state
const lsKey = 'preferredNetwork'

storageProvider.getItem(lsKey)
    .then(network => network && setStellarNetwork(network))

subscribeToStellarNetworkChange(network => storageProvider.setItem(lsKey, network)
    .catch(e => console.error(e)))

//load available accounts
accountManager.reload()
    .then(() => {
        render(<Router history={navigation.history}/>, appContainer)

        //replace the preloader with an app content
        document.body.appendChild(appContainer)
        document.body.removeChild(document.getElementById('pre-loader'))

        //listen for incoming messages
        registerMessageListeners(window)

        //periodically cleanup expired sessions
        scheduleCleanupExpiredSessions()
    })

createNotificationContainer()

webPushNotificationsAdapter.initPushSubscription()