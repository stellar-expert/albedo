import {getLiquidityPoolId, LiquidityPoolAsset, LiquidityPoolFeeV18} from 'stellar-sdk'
import {wrapAsset} from './wrap-asset'

/**
 * Generate constant product liquidity pool id from provided assets
 * @param {Array<String>} assets
 * @return {String}
 */
export function generateLiquidityPoolId(assets) {
    if (assets[0] === assets[1]) return null //invalid pool
    const wrappedAssets = assets.map(a => wrapAsset(a))
    wrappedAssets.sort((a, b) => {
        if (!a.issuer) return -1
        if (!b.issuer) return 1
        if (a.code < b.code) return -1
        if (a.code > b.code) return -1
        if (a.issuer < b.issuer) return -1
        if (a.issuer > b.issuer) return 1
        return 0
    })
    const lp = new LiquidityPoolAsset(wrappedAssets[0], wrappedAssets[1], LiquidityPoolFeeV18),
        id = getLiquidityPoolId('constant_product', lp.getLiquidityPoolParameters())
    return id.toString('hex')
}