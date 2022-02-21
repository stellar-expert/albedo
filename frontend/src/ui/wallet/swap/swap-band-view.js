import React from 'react'
import {observer} from 'mobx-react'
import {formatPrice} from '@stellar-expert/ui-framework'
import AvailableAmountLink from '../shared/available-amount-link-view'
import './swap-band.scss'

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
                {!!settings.conversionPrice && `~${formatPrice(settings.conversionPrice)} ${extractCode(settings.asset[1])}/${extractCode(settings.asset[0])}`}
            </div>
            <div className="switch">
                <a href="#" className="icon-shuffle" onClick={() => settings.reverse()}/>
            </div>
        </> : <div/>}
        <AvailableAmountLink settings={settings} index={0}/>
    </div>
}

export default observer(SwapBandView)