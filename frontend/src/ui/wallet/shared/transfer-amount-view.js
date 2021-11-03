import React from 'react'
import {observer} from 'mobx-react'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import {isValidPoolId, useDependantState, stripTrailingZeros} from '@stellar-expert/ui-framework'
import AssetSelector from './asset-selector-view'

function TransferAmountView({settings, index, balances, filterBalances = 'assets', restricted, placeholder, error}) {
    const amount = settings.amount[index],
        [inputAmount, setInputAmount] = useDependantState(() => {
            if (!amount || amount === '0') return ''
            return amount
        }, [amount]),
        predefinedAssets = balances.map(b => b.id).filter(a => {
            if (filterBalances === 'pools' && !isValidPoolId(a)) return false
            if (filterBalances === 'assets' && isValidPoolId(a)) return false
            return true
        }) //skip

    function change(e) {
        const v = e.target.value.replace(/[^\d.]/g, '')
        setInputAmount(v)
        try {
            const parsed = new BigNumber(v)
            if (parsed.isNegative() || parsed.isNaN()) throw new Error(`Invalid amount: ${v}`)
            const amt = stripTrailingZeros(parsed.toFixed(7, BigNumber.ROUND_DOWN))
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
    //settings container
    settings: PropTypes.shape({
        asset: PropTypes.arrayOf(PropTypes.string),
        amount: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    //positional index of the transfer control
    index: PropTypes.number.isRequired,
    //existing accoutn balances
    balances: PropTypes.arrayOf(PropTypes.object),
    //balance filtering conditions
    filterBalances: PropTypes.oneOf(['all', 'assets', 'pools']),
    //if set available assets list restricted to existing balances only
    restricted: PropTypes.bool,
    //input placeholder text
    placeholder: PropTypes.string,
    error: PropTypes.bool
}

export default observer(TransferAmountView)