import React from 'react'
import PropTypes from 'prop-types'
import Notification from './notification'
import './notifications.scss'

export default function Notifications({ setNotify }) {
    const [notifications, setNotifications] = React.useState([])

    const createNotification = ({ type, message }) => {
        setNotifications((prevNotifications) => {
        return [
            {
                type, 
                message,
                id: prevNotifications.length,
            },
            ...prevNotifications,
        ]})
    }

    React.useEffect(() => {
        setNotify(({ type, message }) => createNotification({ type, message }))
    }, [setNotify])

    const deleteNotification = (id) => {
        const filteredNotifications = notifications.filter((_, index) => id !== index, [])
        setNotifications(filteredNotifications)
    }
    
    return notifications.map(({ id, ...props }, index) => (
        <Notification
        key={id}
        onDelete={() => deleteNotification(index)}
        {...props}
        />
    ))
}

Notifications.propTypes = {
    setNotify: PropTypes.func.isRequired,
}
