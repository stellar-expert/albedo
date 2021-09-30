import React from 'react'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import {useDependantState} from '@stellar-expert/ui-framework'
import AssetSelector from './asset-selector-view'

export default function TransferAmountView({settings, prefix, assets, restricted, placeholder, error}) {
    const amount = settings[prefix + 'Amount'],
        [inputAmount, setInputAmount] = useDependantState(() => {
            if (!amount || amount === '0') return ''
            return amount
        }, [amount])

    function change(e) {
        const v = e.target.value.replace(/[^\d.]/g, '')
        setInputAmount(v)
        try {
            const parsed = new BigNumber(v)
            if (parsed.isNegative() || parsed.isNaN()) throw new Error(`Invalid amount: ${v}`)
            const amt = parsed.toFixed(7, BigNumber.ROUND_DOWN).replace(/\.?0+$/, '')
            settings.setAmount(amt, prefix)
        } catch (e) {
            settings.setAmount('0', prefix)
        }
    }

    function onAssetChange(asset) {
        settings.setAsset(asset, prefix)
    }

    const style = {}
    if (error) {
        style.borderColor = 'var(--color-alert)'
    }

    return <div className="relative">
        <input type="text" value={inputAmount} onChange={change} placeholder={placeholder || '0'} style={style}
               data-lpignore="true"/>
        <AssetSelector value={settings[prefix + 'Asset']} onChange={onAssetChange} predefinedAssets={assets}
                       restricted={restricted}/>
    </div>
}

TransferAmountView.propTypes = {
    settings: PropTypes.shape({
        sourceAsset: PropTypes.string,
        destAsset: PropTypes.string,
        sourceAmount: PropTypes.string,
        destAmount: PropTypes.string
    }).isRequired,
    prefix: PropTypes.oneOf(['source', 'dest']).isRequired,
    assets: PropTypes.arrayOf(PropTypes.string),
    restricted: PropTypes.bool,
    error: PropTypes.bool
}