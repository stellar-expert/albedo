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
 * Decoding is as lenient as Buffer.from(encoded, 'base64') used by previous versions to read the stored data
 * (characters outside base64 alphabet and anything after the padding are ignored, URL-safe alphabet is supported),
 * so the same bytes are restored for any previously stored value.
 * @param {String} encoded - Base64-encoded buffer.
 * @return {Uint8Array}
 */
export function decodeBase64(encoded) {
    let normalized = encoded.split('=')[0]
        .replace(/[^+/0-9A-Za-z\-_]/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    //a single trailing character doesn't contain a full byte
    if (normalized.length % 4 === 1) {
        normalized = normalized.slice(0, -1)
    }
    return xdr.decodeBytes(normalized, 'base64')
}
