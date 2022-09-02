import OneSignal from 'react-onesignal'
import appSettings from '../state/app-settings'
import {getDeviceId} from '../util/crypto/device-id'

const webPushNotificationsAdapter = {
    /**
     * Establish connection to push notifications provider
     * @return {Promise<void>}
     */
    async initPushSubscription() {
        //initialize wrapper
        await OneSignal.init({
            appId: appSettings.oneSignal.appId,
            safari_web_id: appSettings.oneSignal.safariId,
            allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
            //requiresUserPrivacyConsent: true, //implicit request
            promptOptions: {
                actionMessage: 'requests permissions to send transaction requests to this device',
                acceptButton: 'Allow',
                cancelButton: 'Reject',
                showCredit: false
            }
        })
        const deviceId = (await getDeviceId()).toString('hex')
        await OneSignal.setExternalUserId(deviceId)
        /*//listen for events
        OneSignal.on('subscriptionChange', async isSubscribed => {
            if (!isSubscribed) return
            //TODO: send unsubscribe notification to the server?
        })*/
    },
    /**
     * Get user id
     * @return {Promise<String>}
     */
    async getUserId() {
        return await OneSignal.getUserId()
    },
    /**
     * Check if the device has been subscribed for receiving push notifications
     * @return {Promise<Boolean>}
     */
    async isSubscribed() {
        return await OneSignal.isPushNotificationsEnabled()
    },
    /**
     * Show push notification prompt if the device hasn't been subscribed yet
     * @return {Promise<Boolean>}
     */
    async ensurePushNotifications() {
        if (await this.isSubscribed())
            return true
        await OneSignal.provideUserConsent(true)
        await OneSignal.showNativePrompt()
        return await this.isSubscribed()
    }
}

export default webPushNotificationsAdapter