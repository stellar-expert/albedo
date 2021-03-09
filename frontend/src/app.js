import React from 'react'
import {render} from 'react-dom'
import 'mobx-react-lite/batchingForReactDom'
import Nav from './ui/navigation'
import Router from './ui/app-router'
import {scheduleCleanupExpiredSessions} from './storage/implicit-session-storage'
import {registerMessageListeners} from './util/message-listeners'
import {createBrowserHistory} from 'history'
import accountManager from './state/account-manager'
import './ui/styles.scss'

const appContainer = document.createElement('div')

const nav = new Nav(createBrowserHistory(), appContainer)

accountManager.reload()
    .then(() => {
        render(<Router history={nav.history}/>, appContainer)

        document.body.appendChild(appContainer)
        document.body.removeChild(document.getElementById('pre-loader'))

        registerMessageListeners(window)

        scheduleCleanupExpiredSessions()
    })