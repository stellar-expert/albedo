import AES from 'aes-js'
import {decodeBase64} from './base64'

/**
 * AES-encrypt arbitrary data with a password provided by a user.
 * @param {String} plainData - Data to encrypt.
 * @param {Buffer|String} encryptionKey - Hash of the password.
 * @return {String}
 */
export function encryptDataAes(plainData, encryptionKey) {
    validateNonEmpty(plainData, 'plainData')
    const rawData = AES.utils.utf8.toBytes(plainData)
    if (typeof encryptionKey === 'string') {
        encryptionKey = decodeBase64(encryptionKey)
    }
    const aes = new AES.ModeOfOperation.ctr(encryptionKey)
    return Buffer.from(aes.encrypt(rawData)).toString('base64')
}

/**
 * AES-decrypt arbitrary data with a password provided by a user.
 * @param {String} encryptedData - Data to decrypt.
 * @param {Buffer|String} encryptionKey - A password provided by user.
 * @return {String}
 */
export function decryptDataAes(encryptedData, encryptionKey) {
    validateNonEmpty(encryptedData, 'encryptedData')
    const rawData = Buffer.from(encryptedData, 'base64')
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