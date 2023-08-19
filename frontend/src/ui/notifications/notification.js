import React, {useCallback, useEffect, useMemo, useState} from "react"
import {observer} from "mobx-react"
import cn from 'classnames'
import NotificationSettings from "./notification-settings"

const contextIcon = {
    'info': 'icon-info',
    'success': 'icon-ok',
    'warning': 'icon-warning',
    'error': 'icon-warning'
}
const timeToClose = 10 * 1000  //10 sec

function Notification({id, type = 'info', message = '', onDelete}) {
    const [isClosing, setIsClosing] = useState(false)
    const lifetime = useMemo(() => new NotificationSettings({
        start: Date.now(),
        remain: timeToClose
    }), [])
    const close = useCallback(function () {
        setIsClosing(closing => {
            if (closing)
                return closing
            setTimeout(() => onDelete(id), 300)
            return true
        })
    }, [id, onDelete])

    const pauseTimer = useCallback(() => {
        lifetime.pauseTimer(Date.now())
    }, [lifetime])

    const resumeTimer = useCallback(() => {
        lifetime.resumeTimer(Date.now(), close)
    }, [lifetime, close])

    useEffect(() => {
        lifetime.timer = setTimeout(close, timeToClose)
    }, [lifetime, close])

    return <div className={cn('notification-wrap', `notification-${type}`, {grow: !isClosing})}>
        <div className={cn('notification', {slideIn: !isClosing}, {slideOut: isClosing})} onMouseEnter={pauseTimer} onMouseLeave={resumeTimer}>
            <i className={cn('notification-icon', contextIcon[type])}/>
            <div className="text-small">{message}</div>
            <div className="delete" onClick={close}><i className="notification-icon icon-cancel"/></div>
            <div className="lifetime" style={{animationDuration: timeToClose + 'ms'}}/>
        </div>
    </div>
}

export default observer(Notification)