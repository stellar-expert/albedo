import React from 'react'
import {formatAssetUnifiedLink, formatCurrency} from '../../util/formatter'
import {parseAssetInfo} from '../../util/asset-info-parser'
import AssetName from '../components/asset-name'
import './account-balance-view.scss'

function AccountBalanceView({balance, asset}) {
    return <div className="account-balance dual-layout">
        <AssetName asset={asset}/>
        <div className="balance">
            {formatCurrency(balance.balance)}<span className="dimmed text-small">{asset.split('-')[0]}</span>
        </div>
    </div>
}

function AllAccountBalancesView({balances, nonExisting}) {
    if (nonExisting) {
        balances = [{asset_type: 'native', balance: 0}]
    }
    return <div>
        {balances.map(balance => {
            const asset = formatAssetUnifiedLink(parseAssetInfo(balance))
            return <AccountBalanceView key={asset} balance={balance} asset={asset}/>
        })}
        {nonExisting && <div className="dimmed text-micro space text-center">
            (Balances unavailable - account doesn't exist on the ledger)
        </div>}
    </div>
}

export default AllAccountBalancesView