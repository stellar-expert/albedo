import {Keypair} from 'stellar-sdk'

/**
 * Convert the signature hint to the StrKey mask.
 * @param {Buffer} hint - Hint to convert.
 * @return {string}
 */

function hintToMask(hint) {
    const partialPublicKey = Buffer.concat([new Buffer(28).fill(0), hint]),
        hintKeypair = new Keypair({type: 'ed25519', publicKey: partialPublicKey}),
        pk = hintKeypair.publicKey()
    return pk.substr(0, 1) + '_'.repeat(46) + pk.substr(47, 5) + '_'.repeat(4)
}

/**
 * Format the signature hint to the friendly form for UI.
 * @param {Buffer} hint - Hint to convert.
 * @return {string}
 */
function formatHint(hint) {
    const mask = hintToMask(hint)
    return mask.substr(0, 2) + '…' + mask.substr(46)
}

/**
 * Check if the hint matches the specific key.
 * @param {Buffer} hint - Hint to check.
 * @param {String} key - Key to compare.
 * @return {boolean}
 */
function hintMatchesKey(hint, key) {
    return hintToMask(hint).substr(47, 5) === key.substr(47, 5)
}

/**
 * Find a key by the signature hint.
 * @param {Buffer} hint - Hint to look for.
 * @param {Array<String>} allKeys - Array of potentially matching keys.
 * @return {String|null}
 */
function findKeyByHint(hint, allKeys) {
    return allKeys.find(key => hintMatchesKey(hint, key))
}


function findSignatureByKey(key, allSignatures = []) {
    return allSignatures.find(sig => hintMatchesKey(sig.hint(), key))
}


export {
    hintMatchesKey,
    formatHint,
    findKeyByHint,
    findSignatureByKey
}