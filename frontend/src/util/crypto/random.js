import nacl from 'tweetnacl'

/**
 * Generates random key for encryption.
 * @returns {Uint8Array}
 */
export function generateRandomEncryptionKey(seedSize = 32) {
    return nacl.randomBytes(seedSize)
}