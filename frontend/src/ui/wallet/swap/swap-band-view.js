import React from 'react'
import {observer} from 'mobx-react'
import {formatWithAutoPrecision} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import './swap-band.scss'
import AvailableAmountLink from '../shared/available-amount-link-ivew'

function extractCode(asset) {
    return asset.split('-')[0]
}

function SwapBandView({settings}) {
    /*function revert() {
        transfer.reverse(!predefinedAssets.includes(transfer.destAsset))
    }*/

    return <div className="swap-band dual-layout">
        {settings.mode === 'convert' ? <>
            <div className="dimmed text-tiny condensed">
                {settings.conversionPathLoaded && !settings.conversionFeasible && <><i className="icon-block"/>not available</>}
                {!!settings.conversionPrice && `~${formatWithAutoPrecision(settings.conversionPrice)} ${extractCode(settings.asset[1])}/${extractCode(settings.asset[1])}`}
            </div>
            <div className="switch">
                <a href="#" className="icon-shuffle"/>
            </div>
        </> : <div/>}
        <AvailableAmountLink settings={settings} index={0}/>
    </div>
}

export default observer(SwapBandView)