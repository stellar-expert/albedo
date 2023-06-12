import React from 'react'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import AccountAssetBalanceView from './account-asset-balance-view'
import AccountPoolBalanceView from './account-pool-balance-view'
import './account-balance.scss'

function resolveBalanceComponent(balance, asset) {
    if (asset.poolId) return AccountPoolBalanceView
    return AccountAssetBalanceView
}

export default function AccountBalanceView({balance, account}) {
    const asset = parseAssetFromObject(balance)
    const component = resolveBalanceComponent(balance, asset)
    const balanceToRender = React.createElement(component, {asset, balance, account})
    return <div className="account-balance-container">
        {balanceToRender}
        <hr className="flare"/>
    </div>
}