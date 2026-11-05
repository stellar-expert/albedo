import {Keypair} from '@stellar/stellar-sdk'
import {encodeBase64} from './base64'

/**
 * Derive a public key from the plain password.
 * @param {Uint8Array} hash - Hashed encryption key.
 * @return {String}
 */
export function derivePublicKeyFromSecret(hash) {
    return encodeBase64(Keypair.fromRawEd25519Seed(hash).rawPublicKey())
}