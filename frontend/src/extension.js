import React from 'react'
import {render} from 'react-dom'
import Router from './ui/extension-router'
import {scheduleCleanupExpiredSessions} from './storage/session-storage'
import {registerMessageListeners} from './util/message-listeners'
import {createHashHistory} from 'history'
import Nav from './ui/navigation'
import './ui/styles.scss'
import './extension/extension-specific-styles.scss'

const appContainer = document.createElement('div')

const nav = new Nav(createHashHistory(), appContainer)

render(<Router history={nav.history}/>, appContainer)

document.body.appendChild(appContainer)

registerMessageListeners(window)

scheduleCleanupExpiredSessions()
