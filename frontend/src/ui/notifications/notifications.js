import React, {useCallback, useEffect, useState} from 'react'
import {render} from 'react-dom'
import './notifications.scss'
import Notification from './notification'

let notificationsCounter = 0

export function createNotificationContainer() {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(<Notifications/>, container)
    return container
}

export function Notifications() {
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        //declare globally available notify() function
        window.notify = function ({type, message}) {
            const newNotification = {
                type,
                message,
                id: ++notificationsCounter
            }
            setNotifications(prevNotifications => [newNotification, ...prevNotifications])
        }
        //set empty callback on unload
        return () => {
            window.notify = function () {
            }
        }
    }, [])

    const deleteNotification = useCallback(function (id) {
        setNotifications(prev => {
            const pos = prev.findIndex(v => v.id === id)
            if (pos < 0)
                return prev
            const res = [...prev]
            res.splice(pos, 1)
            return res
        })
    }, [])

    return <div className="notifications-container">
        {notifications.map(props => <Notification key={props.id} onDelete={deleteNotification} {...props}/>)}
    </div>
}