import React from 'react'
import PropTypes from 'prop-types'
import {createPortal} from 'react-dom'
import cn from 'classnames'
import {createContainer} from './add-notify'

const containerNotification = createContainer()
const iconDepends = {
    'info': 'icon-info',
    'success': 'icon-ok',
    'warning': 'icon-warning',
    'error': 'icon-warning'
}
const timeToClose = 1000 * 5 //5 sec

export default function Notification({type = 'info', message = '', onDelete}) {
    const [isClosing, setIsClosing] = React.useState(false)

    React.useEffect(() => {
        if (isClosing) {
            const timeoutId = setTimeout(onDelete, 300)
            return () => clearTimeout(timeoutId)
        }
    }, [isClosing, onDelete])

    React.useEffect(() => {
        const timeoutId = setTimeout(() => setIsClosing(true), timeToClose)
        return () => clearTimeout(timeoutId)
    }, [])

    return createPortal(
        <div className={cn(['container-smoothly', {grow: !isClosing}])}>
            <div className={cn(['segment notification', type, {slideIn: !isClosing}, {slideOut: isClosing}])}>
                <i className={`icon ${iconDepends[type]}`}/>
                <div className="text-small">{message}</div>
                <div className="delete" onClick={() => setIsClosing(true)}>
                    <i className="icon icon-cancel"/>
                </div>
            </div>
        </div>,
        containerNotification
    )
}


Notification.propTypes = {
    type: PropTypes.oneOf(Object.keys(iconDepends)),
    message: PropTypes.string,
    onDelete: PropTypes.func.isRequired
}
