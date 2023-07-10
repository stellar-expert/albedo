import React from 'react'
import ReactDOM from 'react-dom'
import Notifications from './notifications'

const containerNotification = createContainer()
let notify

globalThis.notify =

ReactDOM.render(
    <Notifications setNotify={(notifyFn) => {
        notify = notifyFn
    }}/>,
    containerNotification
)


export function addNotify(type, message) {
    return notify({type, message})
}
