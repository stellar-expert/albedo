import React from 'react'
import {navigation} from '@stellar-expert/navigation'
import appSettings from '../../state/app-settings'
import accountManager from '../../state/account-manager'
import wcPendingRequests from '../../state/wc-pending-requests'
import {setActionContext} from '../../state/action-context-initializer'
import {getDeviceId} from '../../util/crypto/device-id'
import webPushNotificationsAdapter from '../../notifications/web-push-notifications-adapter'

class WalletConnectAdapter {
    /**
     * Load requests from the bridge server
     * @return {Promise<Object>}
     */
    async loadRequests() {
        return await this.fetchApi(`/request?device=${await this.getDeviceId()}`)
    }

    async loadSessions() {
        return await this.fetchApi(`/session?device=${await this.getDeviceId()}`)
    }

    /**
     * Approve or reject WalletConnect request from the Dapp
     * @param {{}} request
     * @param {Boolean} approved
     * @return {Promise<void>}
     * @private
     */
    async processRequest(request, result = {approved: false}) {
        const deviceId = await this.getDeviceId()
        //const signature = kp.sign(approveData).toString('hex')
        const res = await this.fetchApi('/request/' + request.id, {
            method: 'POST',
            body: JSON.stringify({
                requestId: request.id,
                result: {
                    ...result,
                    pubkey: request.pubkey || accountManager.activeAccount.publicKey,
                    deviceId
                }
            })
        })
    }

    async approveWcRequest(request, redirectUrl = '/') {
        //require push notifications subscription for pairing
        if (request.method === 'pair' && !await ensureNotificationsEnabled())
            return

        let result = {
            approved: true
        }
        if (request.xdr) {
            const txParams = {
                intent: 'tx',
                pubkey: request.pubkey,
                xdr: request.xdr,
                network: request.network
            }
            if (request.submit) {
                txParams.submit = true
            }
            const actionContext = await setActionContext(txParams)
            const intent = actionContext.intentRequests[0]
            await actionContext.confirmRequest(false)
            if (!intent.result.submit)
                result.signedXdr = intent.result.signed_envelope_xdr
            else
                result.status = 'success'
        }
        await this.processRequest(request, result)
        await wcPendingRequests.fetch()
        //wcPendingRequests.remove(request.id)
        navigation.navigate(redirectUrl)
    }

    async rejectWcRequest(request, redirectUrl = '/') {
        await this.processRequest(request, false)
        wcPendingRequests.remove(request.id)
        await wcPendingRequests.fetch()
        navigation.navigate(redirectUrl)
    }

    async initPairing(pairingLink) {
        const data = await this.fetchApi('/session/pair', {
            method: 'POST',
            body: JSON.stringify({uri: pairingLink})
        })
        //await this.approvePairingRequest(data.requestId, accountPubkey, true)
        return data
    }

    async disconnect(session) {
        const device = await this.getDeviceId()
        await this.fetchApi('/session/pair', {
            method: 'DELETE',
            body: JSON.stringify({pubkey: session.pubkey, device})
        })
        //await this.approvePairingRequest(data.requestId, accountPubkey, true)
        return data
    }

    /**
     * @return {Promise<String>}
     * @private
     */
    async getDeviceId() {
        return (await getDeviceId()).toString('hex')
    }

    /**
     * @param {String} url - Relative url
     * @param {Object} params - Request params
     * @return {Promise<Object>}
     * @private
     */
    async fetchApi(url, params = {}) {
        let result = await fetch(appSettings.walletConnect.broker + url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            ...params
        })
        if (!result.ok)
            throw new Error(`Network request failed: ${result.status}:${result.statusText}`)
        return await result.json()
    }
}

function ensureNotificationsEnabled() {
    return webPushNotificationsAdapter.ensurePushNotifications()
        .then(subscribed => {
            if (!subscribed) {
                alert('You need to allow Albedo push notifications on this device to be able to use WalletConnect')
                return false
            }
            return true
        })
}

const walletConnect = new WalletConnectAdapter()

export default walletConnect