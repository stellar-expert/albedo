import React from 'react'
import {observer} from 'mobx-react'
import {formatAssetUnifiedLink, formatCurrency} from '../../util/formatter'
import {parseAssetInfo} from '../../util/asset-info-parser'
import AssetName from '../components/asset-name'
import {requestFriendbotFunding} from '../../util/horizon-connector'
import './account-balance-view.scss'

function AccountBalanceView({balance, asset}) {
    return <div className="account-balance dual-layout">
        <AssetName asset={asset}/>
        <div className="balance">
            {formatCurrency(balance.balance)}<span className="dimmed text-small">{asset.split('-')[0]}</span>
        </div>
    </div>
}

function AllAccountBalancesView({ledgerData}) {
    let {balances} = ledgerData
    if (ledgerData.nonExisting) {
        balances = [{asset_type: 'native', balance: 0}]
    }

    function createTestnetAccount() {
        requestFriendbotFunding(ledgerData.address)
            .then(() => ledgerData.loadAccountInfo())
    }

    return <div>
        {balances.map(balance => {
            const asset = formatAssetUnifiedLink(parseAssetInfo(balance))
            return <AccountBalanceView key={asset} balance={balance} asset={asset}/>
        })}
        {ledgerData.nonExisting && <div className="dimmed text-micro space text-center">
            (Balances unavailable - account doesn't exist on the ledger)
            {ledgerData.network === 'testnet' && <div>
                We can create a <b>testnet</b> account for you.
                <a href="#" onClick={createTestnetAccount}>Create it now?</a>
            </div>}
        </div>}
    </div>
}

export default observer(AllAccountBalancesView)