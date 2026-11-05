import {xdr} from '@stellar/stellar-sdk'

/**
 * Converts byte array to base64-encoded string.
 * @param {Uint8Array} buffer - Byte array to encode.
 * @return {String}
 */
export function encodeBase64(buffer) {
    return xdr.encodeBytes(buffer, 'base64')
}

/**
 * Converts base64-encoded string to byte array.
 * @param {String} encoded - Base64-encoded buffer.
 * @return {Uint8Array}
 */
export function decodeBase64(encoded) {
    return xdr.decodeBytes(encoded, 'base64')
}
