import {decodeBase64, encodeBase64} from './base64'
import {generateRandomEncryptionKey} from './random'
import storageProvider from '../../storage/storage-provider'

let cachedDeviceId

/**
 * Retrieve a device-specific unique salt for secure Argon2 hashing
 * @return {Promise<Uint8Array>}
 */
export async function getDeviceId() {
    if (cachedDeviceId)
        return cachedDeviceId
    const ds = await storageProvider.getItem('uid')

    let deviceSalt = ds && decodeBase64(ds)
    if (!deviceSalt) {
        deviceSalt = generateRandomEncryptionKey()
        await storageProvider.setItem('uid', encodeBase64(deviceSalt))
    }
    cachedDeviceId = deviceSalt
    return deviceSalt
}
