import React from 'react'
import {render} from 'react-dom'
import {configure} from 'mobx'
import {bindClickNavHandler, navigation} from '@stellar-expert/ui-framework'
import Router from './ui/app-router'
import {scheduleCleanupExpiredSessions} from './storage/implicit-session-storage'
import {registerMessageListeners} from './util/message-listeners'
import accountManager from './state/account-manager'

configure({enforceActions: 'never'})

const appContainer = document.createElement('div')

bindClickNavHandler(appContainer)

accountManager.reload()
    .then(() => {
        render(<Router history={navigation.history}/>, appContainer)

        document.body.appendChild(appContainer)
        document.body.removeChild(document.getElementById('pre-loader'))

        registerMessageListeners(window)

        scheduleCleanupExpiredSessions()
    })