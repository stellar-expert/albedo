

/**
 * Converts byte array to base64-encoded string.
 * @param {Buffer|Uint8Array} buffer - Byte array to encode.
 * @return {String}
 */
export function encodeBase64(buffer) {
    return Buffer.from(buffer).toString('base64')
}

/**
 * Converts base64-encoded string to buffer.
 * @param {String} encoded - Base64-encoded buffer.
 * @return {Buffer}
 */
export function decodeBase64(encoded) {
    return Buffer.from(encoded, 'base64')
}
