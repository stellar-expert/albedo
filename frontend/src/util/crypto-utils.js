import nacl from 'tweetnacl'
import AES from 'aes-js'
import argon2 from 'argon2-browser'

function validateNonEmpty(data, key) {
    if (!data) throw new Error(`Invalid argument: ${key}.`)
    if (typeof data !== 'string') throw new TypeError(`Invalid argument type: ${key}.`)
}

async function computeArgon2Hash(encryptionKey) {
    const {hash} = await argon2.hash({
        pass: encryptionKey,
        salt: 'albedo_auth',
        type: argon2.ArgonType.Argon2id, //the most secure option
        time: 3, // the number of iterations
        mem: 20 * 1024, // used memory, in KiB
        hashLen: 32, // desired hash length
        parallelism: 1 // parallelism
    })
    return hash
}

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
function derivePublicKeyFromSecret(hash) {
    return Buffer.from(deriveKeyPairFromHash(hash).publicKey).toString('base64')
}

/**
 * Generates random key for encryption.
 * @returns {String}
 */
function generateRandomEncryptionKey(seedSize = 32) {
    return encodeBase64(nacl.randomBytes(seedSize))
}

/**
 * Converts byte array to base64-encoded string.
 * @param {Buffer|Uint8Array} buffer - Byte array to encode.
 * @return {String}
 */
function encodeBase64(buffer) {
    return Buffer.from(buffer).toString('base64')
}

/**
 * Converts base64-encoded string to buffer.
 * @param {String} encoded - Base64-encoded buffer.
 * @return {Buffer}
 */
function decodeBase64(encoded) {
    return Buffer.from(encoded, 'base64')
}

/**
 * AES-encrypt arbitrary data with a password provided by a user.
 * @param {String} plainData - Data to encrypt.
 * @param {Buffer|String} encryptionKey - Hash of the password.
 * @return {String}
 */
function encryptDataAes(plainData, encryptionKey) {
    //TODO: use stronger hash for encryption keys passed as strings - default hash might be not good enough
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
function decryptDataAes(encryptedData, encryptionKey) {
    validateNonEmpty(encryptedData, 'encryptedData')
    const rawData = Buffer.from(encryptedData, 'base64')
    if (typeof encryptionKey === 'string') {
        encryptionKey = decodeBase64(encryptionKey)
    }
    const aes = new AES.ModeOfOperation.ctr(encryptionKey),
        decryptedBytes = aes.decrypt(rawData)
    return AES.utils.utf8.fromBytes(decryptedBytes)
}

/**
 * Sign the data with a secret key derived from given password.
 * @param {String} data - Message data to sign.
 * @param {Buffer} encryptionKey - A password provided by user.
 * @returns {String}
 */
function signMessage(data, encryptionKey) {
    validateNonEmpty(data, 'data')
    const auth = deriveKeyPairFromHash(encryptionKey),
        rawData = new Uint8Array(new Buffer(data).toJSON().data),
        signature = nacl.sign.detached(rawData, auth.secretKey)

    return new Buffer(signature).toString('base64')
}

/**
 * Verify the signature.
 * @param {String} data - Message data,
 * @param {String} signature - Message signature in HEX format.
 * @param {String} publicKey - Public key derived from given password.
 * @returns {boolean}
 */
function verifyMessage(data, signature, publicKey) {
    validateNonEmpty(data, 'data')
    const rawData = new Uint8Array(new Buffer(data).toJSON().data),
        rawSignature = new Uint8Array(Buffer.from(signature, 'base64')),
        rawPublicKey = new Uint8Array(Buffer.from(publicKey, 'hex'))

    return nacl.sign.detached.verify(rawData, rawSignature, rawPublicKey)
}

export {
    derivePublicKeyFromSecret,
    signMessage,
    verifyMessage,
    generateRandomEncryptionKey,
    encryptDataAes,
    decryptDataAes,
    computeArgon2Hash,
    encodeBase64,
    decodeBase64
}