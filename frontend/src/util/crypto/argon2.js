import argon2 from 'argon2-browser'
import {getDeviceId} from './device-id'

/**
 * Generate Argon2 hash for a given palin-text encryption key
 * @param {String} encryptionKey
 * @return {Promise<Uint8Array>}
 */
export async function computeArgon2Hash(encryptionKey) {
    const {hash} = await argon2.hash({
        pass: encryptionKey,
        salt: await getDeviceId(),
        type: argon2.ArgonType.Argon2id, //the most secure option
        time: 3, // the number of iterations
        mem: 20 * 1024, // used memory, in KiB
        hashLen: 32, // desired hash length
        parallelism: 1 // parallelism
    })
    return hash
}