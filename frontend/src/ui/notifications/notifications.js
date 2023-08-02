import React, {useCallback, useEffect, useRef, useState} from 'react'
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
    const notification = useRef()
    const start = useRef(Date.now())
    const remain = useRef(timeToClose)
    const timer = useRef()

    const close = useCallback(function () {
        setIsClosing(closing => {
            if (closing)
                return closing
            setTimeout(() => onDelete(id), 300)
            return true
        })
    }, [id, onDelete])

    const pauseTimer = useCallback(() => {
        clearTimeout(timer.current)
        timer.current = null
        remain.current -= Date.now() - start.current
    }, [start, remain])

    const resumeTimer = useCallback(() => {
        if (timer.current) {
            return
        }

        start.current = Date.now()
        timer.current = window.setTimeout(close, remain.current)
    }, [start, remain, close])

    useEffect(() => {
        timer.current = setTimeout(close, timeToClose)

        notification.current.addEventListener("mouseover", pauseTimer, true)
        notification.current.addEventListener("mouseout", resumeTimer, true)
        return () => {
            notification.current?.removeEventListener('mousedown', pauseTimer, true)
            notification.current?.removeEventListener("mouseout", resumeTimer, true)
            notification.current = null
        }
    }, [close, pauseTimer, resumeTimer])

    return <div className={cn('notification-wrap', `notification-${type}`, {grow: !isClosing})}>
        <div ref={notification} className={cn('notification', {slideIn: !isClosing}, {slideOut: isClosing})}>
            <i className={cn('icon', iconDepends[type])}/>
            <div className="text-small">{message}</div>
            <div className="delete" onClick={close}><i className="icon icon-cancel"/></div>
            <div className="lifetime" style={{animationDuration: timeToClose + 'ms'}}/>
        </div>
    </div>
}