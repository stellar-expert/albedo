import {StellarTomlResolver} from 'stellar-sdk'
import {resolveAccountInfo} from './account-info-resolver'

const metaCache = {}

function fetchMeta(asset, networkId) {
    if (!asset.issuer) return Promise.resolve({icon: '/img/vendor/stellar.svg'})
    return resolveAccountInfo(asset.issuer, networkId)
        .then(issuerAccount => {
            if (!issuerAccount.home_domain) return {}
            return StellarTomlResolver.resolve(issuerAccount.home_domain, {timeout: 3000})
                .then(toml => {
                    const assetInfo = toml.CURRENCIES.find(c => c.code === asset.code && c.issuer === asset.issuer)
                    if (assetInfo) {
                        return {
                            domain: issuerAccount.home_domain,
                            decimals: assetInfo.display_decimals,
                            icon: assetInfo.image
                        }
                    }
                })
        })
        .catch(e => {
            console.error(e)
            return {}
        })
}

export function resolveAssetMeta(asset, networkId){
    const key = `${networkId}-${asset.code}-${asset.issuer||''}`
    let meta = metaCache[key]
    if (!meta) {
        meta = metaCache[key] = fetchMeta(asset, networkId)
    }
    return meta
}