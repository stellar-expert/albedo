import {entropyToMnemonic, mnemonicToEntropy, validateMnemonic as validate, wordlists} from 'bip39'
import {Keypair} from 'stellar-sdk'

const mnemonicWordsList = wordlists.english

/**
 * Converts a secret key to 24-word BIP-39 mnemonic code.
 * @param {String} secret
 * @returns {String}
 */
function secretToMnemonic(secret) {
    const kp = Keypair.fromSecret(secret)
    return entropyToMnemonic(kp.rawSecretKey(), mnemonicWordsList)
}

/**
 * Converts 24-word BIP-39 mnemonic code to a secret key.
 * @param {String} mnemonic
 * @returns {String|null}
 */
function mnemonicToSecret(mnemonic) {
    try {
        const rawSecret = mnemonicToEntropy(mnemonic, mnemonicWordsList)
        return Keypair.fromRawEd25519Seed(Buffer.from(rawSecret, 'hex')).secret()
    } catch (e) {
        console.error(e)
        return null
    }
}

function validateMnemonic(mnemonic) {
    return validate(mnemonic, mnemonicWordsList)
}

export {secretToMnemonic, mnemonicToSecret, validateMnemonic, mnemonicWordsList}