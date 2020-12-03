import React from 'react'
import {observer} from 'mobx-react'
import {formatAssetUnifiedLink, formatCurrency} from '../../util/formatter'
import {parseAssetInfo} from '../../util/asset-info-parser'
import AssetName from '../components/asset-name'
import {requestFriendbotFunding} from '../../util/horizon-connector'

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
            return <div key={asset} className="segment text-center micro-space" style={{padding: '0.3em 0.8em 0.8em'}}>
                <h3>{formatCurrency(balance.balance)}</h3>
                <div className="text-small"><AssetName asset={asset}/></div>
            </div>
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