/**
 * Generates random key for encryption.
 * @returns {Uint8Array}
 */
export function generateRandomEncryptionKey(seedSize = 32) {
    const res = new Uint8Array(seedSize)
    crypto.getRandomValues(res)
    return res
}