import React, {useCallback, useEffect, useState} from 'react'
import {render} from 'react-dom'
import cn from 'classnames'
import './notifications.scss'

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

const iconDepends = {
    'info': 'icon-info',
    'success': 'icon-ok',
    'warning': 'icon-warning',
    'error': 'icon-warning'
}
const timeToClose = 10 * 1000  //10 sec

function Notification({id, type = 'info', message = '', onDelete}) {
    const [isClosing, setIsClosing] = useState(false)

    const close = useCallback(function () {
        setIsClosing(closing => {
            if (closing)
                return closing
            setTimeout(() => onDelete(id), 300)
            return true
        })
    }, [])

    useEffect(() => {
        setTimeout(close, timeToClose)
    }, [])

    return <div className={cn('container-smoothly', {grow: !isClosing})}>
        <div className={cn('segment notification', type, {slideIn: !isClosing}, {slideOut: isClosing})}>
            <i className={cn('icon', iconDepends[type])}/>
            <div className="text-small">{message}</div>
            <div className="delete" onClick={close}><i className="icon icon-cancel"/></div>
        </div>
    </div>
}