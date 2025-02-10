import {StrKey} from '@stellar/stellar-base'
/**
 * Extract a short device/account identifier from a given pubkey.
 * @param {String} publicKey - Stellar pub key.
 * @return {String}
 * @deprecated
 */
function extractDeviceId(publicKey){
    const raw = StrKey.decodeEd25519PublicKey(publicKey)
    return raw.slice(0, 16).toString('base64')
}

export {extractDeviceId}