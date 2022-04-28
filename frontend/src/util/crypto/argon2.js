import argon2 from 'argon2-browser'
import storageProvider from '../../storage/storage-provider'
import {decodeBase64, encodeBase64} from './base64'
import {generateRandomEncryptionKey} from './random'

/**
 * Retrieve a device-specific unique salt for secure Argon2 hashing
 * @return {Promise<Uint8Array>}
 */
async function getDeviceSalt(){
    const ds = await storageProvider.getItem('uid')

    let deviceSalt = ds && decodeBase64(ds)
    if (!deviceSalt) {
        deviceSalt = generateRandomEncryptionKey()
        await storageProvider.setItem('uid', encodeBase64(deviceSalt))
    }
    return deviceSalt
}

/**
 * Generate Argon2 hash for a given palin-text encryption key
 * @param {String} encryptionKey
 * @return {Promise<Uint8Array>}
 */
export async function computeArgon2Hash(encryptionKey) {
    const {hash} = await argon2.hash({
        pass: encryptionKey,
        salt: await getDeviceSalt(),
        type: argon2.ArgonType.Argon2id, //the most secure option
        time: 3, // the number of iterations
        mem: 20 * 1024, // used memory, in KiB
        hashLen: 32, // desired hash length
        parallelism: 1 // parallelism
    })
    return hash
}