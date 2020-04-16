import React from 'react'
import {render} from 'react-dom'
import Nav from './ui/navigation'
import Router from './ui/app-router'
import {scheduleCleanupExpiredSessions} from './storage/session-storage'
import {registerMessageListeners} from './util/message-listeners'
import {createBrowserHistory} from 'history'
import './ui/styles.scss'

const appContainer = document.createElement('div')

const nav = new Nav(createBrowserHistory(), appContainer)

render(<Router history={nav.history}/>, appContainer)

document.body.appendChild(appContainer)

registerMessageListeners(window)

scheduleCleanupExpiredSessions()
