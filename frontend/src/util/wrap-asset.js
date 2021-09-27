import {Asset} from 'stellar-sdk'

export function wrapAsset(asset) {
    const parts = asset.split('-')
    if (parts.length < 2) return Asset.native()
    return new Asset(parts[0], parts[1])
}