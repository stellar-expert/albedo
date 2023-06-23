import React from 'react'
import ReactDOM from 'react-dom'
import Notifications from './notifications'

const containerNotification = createContainer()
let notify

ReactDOM.render(
    <Notifications setNotify={(notifyFn) => {
        notify = notifyFn
    }}/>,
    containerNotification
)

export function createContainer() {
    const containerId = "notification-container"
    let container = document.getElementById(containerId)

    if (container) return container

    container = document.createElement("div")
    container.setAttribute("id", containerId)
    document.body.appendChild(container)

    return container
}

export function addNotify(type, message) {
    return notify({type, message})
}
