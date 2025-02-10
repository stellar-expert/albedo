import {isInsideFrame} from '../util/frame-utils'
import storageProvider from './storage-provider'

/**
 * Send synchronize localStorage command to same origin iframes.
 */
export async function syncLocalStorage() {
    //do not allow to send sync commands from iframes
    if (isInsideFrame())
        return
    //obtain caller window reference
    const caller = window.opener
    if (!caller || caller === window) return
    //copy all data from localStorage
    const dataToSync = {}
    const allKeys = await storageProvider.enumerateKeys()
    for (let key of allKeys) {
        dataToSync[key] = await storageProvider.getItem(key)
    }
    //try to find and sync implicit transport iframe
    const {frames} = caller
    for (let i = 0; i < frames.length; i++) {
        try {
            const frame = frames[i]
            if (frame.origin === window.origin) { //assume it's an implicit container iframe
                frame.postMessage({sync: dataToSync}, window.origin)
            }
        } catch (e) {
            //the frame is inaccessible - ignore errors
        }
    }
}