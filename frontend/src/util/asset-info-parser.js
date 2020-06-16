export function parseAssetInfo(descriptor) {
    if (!descriptor) return null
    if (descriptor.asset_type === 'native') return {code: 'XLM'}
    return {code: descriptor.asset_code, issuer: descriptor.asset_issuer}
}