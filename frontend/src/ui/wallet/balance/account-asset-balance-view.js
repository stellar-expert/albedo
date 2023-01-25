import React from 'react'
import {AssetIcon, AssetIssuer} from '@stellar-expert/ui-framework'
import BalanceAmount from './balance-amount'

export default function AccountAssetBalanceView({balance, asset}) {
    const assetId = asset.toFQAN()
    return <>
        <div className="account-balance">
            <AssetIcon asset={asset}/>
            <div className="text-left text-overflow">
                <div className="asset-code">{asset.code}</div>
                <AssetIssuer asset={asset}/>
            </div>
            <div>
                <BalanceAmount amount={balance.balance}/>
                {balance.estimated > 0 ?
                    <div className="estimated-amount dimmed text-tiny">
                        ~{balance.estimated}$
                    </div> :
                    <br/>}
            </div>
        </div>
        <div className="account-balance-actions">
            <a href={'/wallet/transfer?fromAsset=' + assetId}><i className="icon-angle-double-right"/>transfer</a>
            {!asset.isNative && <>&emsp;<a href={'/wallet/remove-trustline?asset=' + assetId}><i className="icon-angle-double-right"/>remove trustline</a></>}
        </div>
    </>
}