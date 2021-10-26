import React from 'react'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import {useDependantState} from '@stellar-expert/ui-framework'
import AssetSelector from './asset-selector-view'

export default function TransferAmountView({settings, index, predefinedAssets, restricted, placeholder, error}) {
    const amount = settings.amount[index],
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
            settings.setAmount(amt, index)
        } catch (e) {
            settings.setAmount('0', index)
        }
    }

    function onAssetChange(asset) {
        settings.setAsset(asset, index)
    }

    const style = {}
    if (error) {
        style.borderColor = 'var(--color-alert)'
    }

    return <div className="relative">
        <input type="text" value={inputAmount} onChange={change} placeholder={placeholder || '0'} style={style}
               data-lpignore="true"/>
        <AssetSelector value={settings.asset[index]} onChange={onAssetChange} predefinedAssets={predefinedAssets}
                       restricted={restricted}/>
    </div>
}

TransferAmountView.propTypes = {
    settings: PropTypes.shape({
        asset: PropTypes.arrayOf(PropTypes.string),
        amount: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    index: PropTypes.number.isRequired,
    predefinedAssets: PropTypes.arrayOf(PropTypes.string),
    restricted: PropTypes.bool,
    error: PropTypes.bool
}