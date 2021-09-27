import React from 'react'
import {observer} from 'mobx-react'
import {formatWithAutoPrecision} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import './swap-band.scss'

function extractCode(asset) {
    return asset.split('-')[0]
}

function SwapBandView({settings}) {
    const availableSourceBalance = accountLedgerData.getAvailableBalance(settings.sourceAsset)

    /*function revert() {
        transfer.reverse(!predefinedAssets.includes(transfer.destAsset))
    }*/

    return <div className="swap-band dual-layout">
        {settings.mode === 'convert' ? <>
            <div className="dimmed text-tiny condensed">
                {settings.conversionPathLoaded && !settings.conversionFeasible && <><i className="icon-block"/>not available</>}
                {!!settings.conversionPrice && `~${formatWithAutoPrecision(settings.conversionPrice)} ${extractCode(settings.destAsset)}/${extractCode(settings.sourceAsset)}`}
            </div>
            <div className="switch">
                <a href="#" className="icon-shuffle"/>
            </div>
        </> : <div/>}
        <div className="dimmed text-tiny condensed text-right">
            <a className="dimmed" href="#"
               onClick={e => settings.setAmount(availableSourceBalance, 'source')}>
                {availableSourceBalance} {extractCode(settings.sourceAsset)} available
            </a>
        </div>
    </div>
}

export default observer(SwapBandView)