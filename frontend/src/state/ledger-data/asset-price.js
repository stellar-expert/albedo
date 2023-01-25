import {stringifyQuery} from '@stellar-expert/navigation'

/**
 * @param {'public'|'testnet'} network
 * @param {String[]} asset
 * @return {Promise<{}>}
 */
export async function fetchAssetPrices(network, asset) {
    const ap = await fetch(`${explorerApiOrigin}/explorer/${network}/asset/price${stringifyQuery({asset})}`)
        .then(r => r.json())
    const res = {}
    for (const {asset, price} of ap._embedded.records){
        res[asset] = price
    }
    return res
}