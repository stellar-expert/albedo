import React, {useEffect, useState} from 'react'
import Bignumber from 'bignumber.js'
import {AssetDescriptor, formatPrice, useStellarNetwork} from '@stellar-expert/ui-framework'
import {resolveOrderbookInfo} from '../../../util/orderbook-info-resolver'

export default function LiquidityPoolNonexistentView({assets}) {
    const network = useStellarNetwork(),
        [price, setPrice] = useState(null)
    assets = assets.map(a => AssetDescriptor.parse(a).toAsset())
    useEffect(() => {
        setPrice(null)
        resolveOrderbookInfo(network, assets, 2)
            .then(orderbook => {
                const [bestBid] = orderbook.bids,
                    [bestAsk] = orderbook.asks
                if (!bestBid || !bestAsk) return
                const price = new Bignumber(bestBid.price_r.n).div(bestBid.price_r.d)
                    .plus(new Bignumber(bestAsk.price_r.n).div(bestAsk.price_r.d))
                    .toNumber()
                setPrice(price)
            })
    }, [network, assets.map(a => a.toString()).join()])

    return <div className="segment text-small">
        <div className="dimmed">This liquidity pool doesn't exist.
            You can deposit assets to create the pool.
        </div>
        {price !== null && <div className="space dual-layout">
            <div className="dimmed">Orderbook price:</div>
            <div>{formatPrice(price)} {assets[0].code}/{assets[1].code}</div>
        </div>}
    </div>
}