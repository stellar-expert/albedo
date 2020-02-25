/**
 * Format numeric currency.
 * @param {String|Number} value - Value to format.
 * @param {Number} decimals - Decimals count.
 * @param {String} separator - Digit groups separator.
 * @return {String}
 */
function formatCurrency(value, decimals = 7, separator = ',') {
    let numeric = parseFloat(value)
    //0 by default
    if (isNaN(numeric)) {
        numeric = 0
    }
    //use 7 decimals if not specified
    if (!(decimals >= 0)) {
        decimals = 7
    }
    //split numeric to parts
    let str = numeric.toFixed(decimals),
        [left, right = ''] = str.split('.'),
        res = ''
    //split digit groups
    while (left.length > 3) {
        res = separator + left.substr(-3) + res
        left = left.substr(0, left.length - 3)
    }
    //split negative sign
    if (left === '-') {
        res = res.substr(1)
    }
    res = left + res
    //cleanup and add right part
    right = right.replace(/0+$/, '')
    if (right) {
        res += '.' + right
    }
    return res
}

/**
 * Format Stellar account address.
 * @param {String} address - Stellar account public key.
 * @param {Number} [significantChars] - Number of leading and trailing chars to display.
 * @return {String}
 */
function formatAddress(address, significantChars = 12) {
    if (!address || address.length !== 56 || significantChars > 26) return address
    const slength = Math.max(2, Math.floor(significantChars / 2))
    return address.substr(0, slength) + '…' + address.substr(-slength)
}

/**
 * Format a unified asset link compatible with StellarExpert.
 * @param {Object} asset - Asset descriptor.
 * @param {String} asset.code - Asset code.
 * @param {String} asset.issuer - Asset issuer (skip for native XLM tokens).
 * @return {String}
 */
function formatAssetUnifiedLink(asset) {
    if (asset.code === 'XLM' && !asset.issuer) return 'XLM'
    return asset.code + '-' + asset.issuer
}

export {
    formatAddress,
    formatAssetUnifiedLink,
    formatCurrency
}