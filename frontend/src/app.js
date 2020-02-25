import React from 'react'
import {render} from 'react-dom'
import Router from './ui/router'
import {createBrowserHistory} from 'history'
import accountManager from './state/account-manager'
import {scheduleCleanupExpiredSessions} from './storage/session-storage'
import './ui/styles.scss'
import { registerMessageListeners } from './message-listeners'

const history = createBrowserHistory()
const appContainer = document.createElement('div')

window.__history = history

appContainer.addEventListener('click', e => {
    //ignore ctrl+click
    if (e.ctrlKey) return
    let link = e.target
    while (link && link.tagName.toLowerCase() !== 'a') {
        link = link.parentElement
    }
    if (link) {
        const href = link.getAttribute('href')
        // Skip empty links
        if (href === '#') return e.preventDefault()
        // Sometimes links don't have href (null received)
        if (!href) return
        //Skip external links
        if (link.target === '_blank') return
        if (link.classList.contains('external-link')) return
        if (/^(mailto:|tel:|(https?):\/\/)/.test(href)) return

        let currentLocation = window.location

        e.preventDefault()
        // When history works, internal links sometimes should not trigger page refresh
        if ((currentLocation.pathname + currentLocation.search) === href) return
        __history.push(href)
        window.scrollTo(0, 0)
    }
})

render(<Router history={history}/>, appContainer)

document.body.appendChild(appContainer);

registerMessageListeners(window)

scheduleCleanupExpiredSessions()
