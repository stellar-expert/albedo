import React, {useEffect, useState} from 'react'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {formatPrice} from '@stellar-expert/formatter'
import {resolveOrderbookInfo} from '../../../util/orderbook-info-resolver'

export default function LiquidityPoolNonexistentView({assets}) {
    const network = useStellarNetwork()
    const [price, setPrice] = useState(null)
    assets = assets.map(a => AssetDescriptor.parse(a).toAsset())
    useEffect(() => {
        setPrice(null)
        resolveOrderbookInfo(network, assets, 2)
            .then(orderbook => {
                const [bestBid] = orderbook.bids
                const [bestAsk] = orderbook.asks
                if (!bestBid || !bestAsk) return
                const price = (bestBid.price_r.n / bestBid.price_r.d + bestAsk.price_r.n / bestAsk.price_r.d) / 2
                setPrice(price)
            })
    }, [network, assets.map(a => a.toString()).join()])

    return <div className="segment text-small space">
        <div className="dimmed">This liquidity pool doesn't exist.
            You can deposit assets to create the pool.
        </div>
        {price !== null && <div className="space dual-layout">
            <div className="dimmed">Orderbook price:</div>
            <div>{formatPrice(price)} {assets[0].code}/{assets[1].code}</div>
        </div>}
    </div>
}