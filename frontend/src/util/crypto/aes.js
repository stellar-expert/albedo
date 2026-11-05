import AES from 'aes-js'
import {encodeBase64, decodeBase64} from './base64'

/**
 * AES-encrypt arbitrary data with a password provided by a user.
 * @param {String} plainData - Data to encrypt.
 * @param {Uint8Array|String} encryptionKey - Hash of the password.
 * @return {String}
 */
export function encryptDataAes(plainData, encryptionKey) {
    validateNonEmpty(plainData, 'plainData')
    const rawData = AES.utils.utf8.toBytes(plainData)
    if (typeof encryptionKey === 'string') {
        encryptionKey = decodeBase64(encryptionKey)
    }
    const aes = new AES.ModeOfOperation.ctr(encryptionKey)
    return encodeBase64(aes.encrypt(rawData))
}

/**
 * AES-decrypt arbitrary data with a password provided by a user.
 * @param {String} encryptedData - Data to decrypt.
 * @param {Uint8Array|String} encryptionKey - A password provided by user.
 * @return {String}
 */
export function decryptDataAes(encryptedData, encryptionKey) {
    validateNonEmpty(encryptedData, 'encryptedData')
    const rawData = decodeBase64(encryptedData)
    if (typeof encryptionKey === 'string') {
        encryptionKey = decodeBase64(encryptionKey)
    }
    const aes = new AES.ModeOfOperation.ctr(encryptionKey),
        decryptedBytes = aes.decrypt(rawData)
    return AES.utils.utf8.fromBytes(decryptedBytes)
}

function validateNonEmpty(data, key) {
    if (!data) throw new Error(`Invalid argument: ${key}.`)
    if (typeof data !== 'string') throw new TypeError(`Invalid argument type: ${key}.`)
}