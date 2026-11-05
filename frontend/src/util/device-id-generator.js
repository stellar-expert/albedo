import {StrKey} from '@stellar/stellar-sdk'
import {encodeBase64} from './crypto/base64'
/**
 * Extract a short device/account identifier from a given pubkey.
 * @param {String} publicKey - Stellar pub key.
 * @return {String}
 * @deprecated
 */
function extractDeviceId(publicKey){
    const raw = StrKey.decodeEd25519PublicKey(publicKey)
    return encodeBase64(raw.subarray(0, 16))
}

export {extractDeviceId}