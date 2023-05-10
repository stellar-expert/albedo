import React from 'react'
import PropTypes from 'prop-types'
import {createPortal} from 'react-dom'
import cn from 'classnames'
import {createContainer} from './add-notify'

const containerNotification = createContainer()

let timeToClose = 1000 * 5 // 5 sec

export default function Notification({type = 'info', message = '', onDelete}) {
    const [isClosing, setIsClosing] = React.useState(false)

    React.useEffect(() => {
        if (isClosing) {
            const timeoutId = setTimeout(onDelete, 300)
      
            return () => clearTimeout(timeoutId)
        }
    }, [isClosing, onDelete])

    React.useEffect(() => {
        const timeoutId = setTimeout(() => setIsClosing(true), timeToClose);

        return () => clearTimeout(timeoutId)
    }, [])

    return createPortal(
        <div className={cn(['container-smoothly', { grow: !isClosing }])}>
            <div className={cn(['notification', type, {slideIn: !isClosing}, {slideOut: isClosing}])} >
                {message}
            </div>
        </div>,
        containerNotification
    );
}


Notification.propTypes = {
    type: PropTypes.oneOf(['info','success','warning','error']),
    message: PropTypes.string,
    onDelete: PropTypes.func.isRequired
};
