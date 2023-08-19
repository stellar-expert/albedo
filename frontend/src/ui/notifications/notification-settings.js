import {makeAutoObservable} from "mobx"

export default class NotificationSettings {
    constructor({start, remain}) {
        this.timer = null
        this.start = start
        this.remain = remain

        makeAutoObservable(this)
    }

    pauseTimer(pauseTime) {
        clearTimeout(this.timer)
        this.timer = null
        this.remain -= pauseTime - this.start
    }

    resumeTimer(restartTime, action) {
        if (this.timer) {
            return
        }

        this.start = restartTime
        this.timer = setTimeout(action, this.remain)
    }
}