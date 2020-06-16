import {StrKey} from 'stellar-sdk'
/**
 * Extract a short device/account identifier from a given pubkey.
 * @param {String} publicKey - Stellar pub key.
 * @return {String}
 */
function extractDeviceId(publicKey){
    const raw = StrKey.decodeEd25519PublicKey(publicKey)
    return raw.slice(0, 16).toString('base64')
}

export {extractDeviceId}