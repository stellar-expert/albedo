import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {formatPrice} from '@stellar-expert/formatter'
import {isValidPoolId} from '@stellar-expert/asset-descriptor'
import AvailableAmountLink from '../shared/available-amount-link-view'
import './swap-band.scss'
import {InfoTooltip} from '@stellar-expert/ui-framework'

function extractCode(asset) {
    return asset.split('-')[0]
}

function SwapBandView({settings, balances}) {
    /*function revert() {
        transfer.reverse(!predefinedAssets.includes(transfer.destAsset))
    }*/
    const predefinedAssets = balances?.map(b => b.id).filter(a => !isValidPoolId(a))
    const disabled = !predefinedAssets.includes(settings.asset[1]) || settings.asset[0] === settings.asset[1]

    const reverseAsset = useCallback(() => settings.reverse(), [settings])

    return <div className="swap-band dual-layout">
        {!settings.mode || settings.mode === 'convert' ? <>
            <div className="dimmed text-tiny condensed">
                {settings.conversionPathLoaded && !settings.conversionFeasible && <>
                    <i className="icon-block"/> Not available
                    {!!settings.brokerError && <InfoTooltip icon="icon-warning">{settings.brokerError}</InfoTooltip>}
                </>}
                {!!settings.conversionPrice && `~${formatPrice(settings.conversionPrice)} ${extractCode(settings.asset[1])}/${extractCode(settings.asset[0])}`}
            </div>
            <div className="switch">
                {disabled ? <i className="icon-shuffle"/> : <a href="#" className="icon-shuffle" onClick={reverseAsset}/>}
            </div>
        </> : <div/>}
        <AvailableAmountLink settings={settings} index={0} trading/>
    </div>
}

export default observer(SwapBandView)