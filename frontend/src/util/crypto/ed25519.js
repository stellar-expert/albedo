import nacl from 'tweetnacl'

/**
 * Derive a keypair suitable for signing from a hash of the encryption key.
 * @param {Buffer} hash - Hashed encryption key.
 * @return {nacl.SignKeyPair}
 */
function deriveKeyPairFromHash(hash) {
    return nacl.sign.keyPair.fromSeed(hash)
}

/**
 * Derive a public key from the plain password.
 * @param {Buffer} hash - Hashed encryption key.
 * @return {String}
 */
export function derivePublicKeyFromSecret(hash) {
    return Buffer.from(deriveKeyPairFromHash(hash).publicKey).toString('base64')
}