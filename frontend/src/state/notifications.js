import {observable, action, makeObservable} from 'mobx'

class NotificationService {
    notification = {
        show: false,
        body: null
    }

    constructor() {
        makeObservable(this, {
            notification: observable,
            showNotification: action,
            closeNotification: action
        })
    }

    showNotification(body) {
        this.notification.show = true
        this.notification.body = body
    }

    closeNotification() {
        this.notification.show = false
        this.notification.body = null
    }
}

const notificationService = new NotificationService()

export default notificationService
