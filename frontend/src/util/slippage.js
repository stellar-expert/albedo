import {fromStroops, toStroops} from '@stellar-expert/formatter'

/**
 * Adjust amount with regard to maximum slippage amount
 * @param {String|BigInt} value
 * @param {BigInt} direction
 * @param {Number} slippage
 * @return {BigInt}
 */
export function withSlippage(value, slippage) {
    const adjustment = BigInt(100 + slippage)
    if (typeof value === 'string') {
        value = toStroops(value)
    }
    const res = value * adjustment / 100n
    return res
}