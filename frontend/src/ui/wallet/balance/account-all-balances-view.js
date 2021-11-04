import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {parseAssetFromObject} from '@stellar-expert/ui-framework'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import AccountBalanceView from './account-balance-view'

function AllAccountBalancesView({ledgerData}) {
    const [fundingInProgress, setFundingInProgress] = useState(false)
    if (!ledgerData || fundingInProgress) return <div className="loader"/>
    if (ledgerData.error && !ledgerData.nonExisting) return <div className="text-small error">
        <i className="icon-warning"/> {ledgerData.error}
    </div>

    let {address, network, balances, nonExisting} = ledgerData
    if (nonExisting) {
        balances = {XLM: {asset_type: 'native', balance: 0}}
    }

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(address)
            .then(() => new Promise(r => setTimeout(r, 5000)))
            .then(() => ledgerData.loadAccountInfo())
            .finally(() => setFundingInProgress(false))
    }

    return <div>
        {Object.values(balances).map(balance => {
            const asset = parseAssetFromObject(balance)
            return <AccountBalanceView balance={balance} asset={asset} key={asset.toFQAN()}/>
        })}
        {nonExisting && <div className="dimmed text-tiny space text-center">
            (Balances unavailable - account doesn't exist on the ledger)
            {network === 'testnet' && <div>
                We can create a <b>testnet</b> account for you.{' '}
                <a href="#" onClick={createTestnetAccount}>Create it now?</a>
            </div>}
        </div>}
    </div>
}

export default observer(AllAccountBalancesView)