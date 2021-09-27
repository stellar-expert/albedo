import React from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, AssetDescriptor, useAssetMeta} from '@stellar-expert/ui-framework'
import {formatAssetUnifiedLink, formatCurrency} from '../../../util/formatter'
import {parseAssetInfo} from '../../../util/asset-info-parser'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import './account-balance.scss'

function AccountBalanceView({balance, asset}) {
    asset = new AssetDescriptor(asset)
    const meta = useAssetMeta(asset),
        icon = asset.isNative ? '/img/vendor/stellar.png' : (meta?.toml_info?.image || meta?.toml_info?.orgLogo)

    return <>
        <div key={asset.toString()} className="account-balance">
            {icon ?
                <div style={{backgroundImage: `url('${icon}')`}} className="asset-icon"/> :
                <div className="asset-icon icon icon-cubes"/>}
            <div className="text-left">
                <div className="asset-code">
                    {asset.code}
                </div>
                <div className="asset-issuer">
                    {meta?.domain ?
                        <>{meta.domain}</> :
                        <><AccountAddress account={asset.issuer} link={false} chars={10} icon={false}/></>
                    }
                </div>
            </div>
            <div>
                <div className="asset-amount"><BalanceAmount amount={balance.balance}/></div>
            </div>
        </div>
        <hr className="flare"/>
    </>
}

function AllAccountBalancesView({ledgerData}) {
    if (!ledgerData) return <div className="loader"/>
    if (ledgerData.error && !ledgerData.nonExisting) return <div className="text-small error">
        <i className="icon-warning"/> {ledgerData.error}
    </div>

    let {address, network, balances, nonExisting} = ledgerData
    if (nonExisting) {
        balances = {XLM: {asset_type: 'native', balance: 0}}
    }

    function createTestnetAccount() {
        requestFriendbotFunding(address)
            .then(() => ledgerData.loadAccountInfo())
    }

    return <div>
        {Object.values(balances).map(balance => {
            const asset = formatAssetUnifiedLink(parseAssetInfo(balance))
            return <AccountBalanceView key={asset} balance={balance} asset={asset}/>
        })}
        {nonExisting && <div className="dimmed text-tiny space text-center">
            (Balances unavailable - account doesn't exist on the ledger)
            {network === 'testnet' && <div>
                We can create a <b>testnet</b> account for you.
                <a href="#" onClick={createTestnetAccount}>Create it now?</a>
            </div>}
        </div>}
    </div>
}


function BalanceAmount({amount}) {
    const [integer, fractional] = formatCurrency(amount).split('.')
    return <>{integer}{!!fractional && <span className="dimmed text-small">.{fractional}</span>}</>
}

export default observer(AllAccountBalancesView)