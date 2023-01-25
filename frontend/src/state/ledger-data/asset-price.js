import {stringifyQuery} from '@stellar-expert/navigation'
import {InMemoryClientCache} from '@stellar-expert/client-cache'

const apiCache = new InMemoryClientCache({prefix: 'ac:'})

/**
 * @param {'public'|'testnet'} network
 * @param {String[]} asset
 * @return {Promise<{}>}
 */
export async function fetchAssetPrices(network, asset) {
        const assets = {}
        //map unique assets to claimable balances
        for (let a of asset) {
            assets[a] = 0
        }
        let uniqueAssets = Object.keys(assets)
        //retrieve prices from the server
        while (uniqueAssets.length > 0) {
            //take 100 records for the batch
            const batch = uniqueAssets.slice(0, 50)
            uniqueAssets = uniqueAssets.slice(50)
            //retrieve asset prices
            const ap = await fetch(`${explorerApiOrigin}/explorer/${network}/asset/price${stringifyQuery({asset: batch})}`)
                .then(r => r.json())
            for (const {asset, price} of ap?._embedded?.records || []) {
                assets[asset] = price
            }
        }

        return assets
}