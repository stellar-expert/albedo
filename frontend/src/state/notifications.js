import {observable, action} from 'mobx'

class NotificationService {
    @observable notification = {
        show: false,
        body: null
    }

    @action showNotification(body) {
        this.notification.show = true;
        this.notification.body = body;
    }

    @action closeNotification() {
        this.notification.show = false;
        this.notification.body = null;
    }
}

const notificationService = new NotificationService()

export default notificationService
