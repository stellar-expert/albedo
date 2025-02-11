import React from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import {useAutoFocusRef, useDependantState, AssetSelector} from '@stellar-expert/ui-framework'
import {isValidPoolId} from '@stellar-expert/asset-descriptor'
import {formatWithAutoPrecision, fromStroops, toStroops} from '@stellar-expert/formatter'
import './transfer-amount.scss'

function TransferAmountView({
                                settings,
                                index = 0,
                                balances,
                                filterBalances = 'assets',
                                restricted,
                                placeholder,
                                autofocus = false,
                                readOnly,
                                assetSelectorDisabled,
                                profit,
                                error
                            }) {
    const amount = settings.amount[index]
    const [inputAmount, setInputAmount] = useDependantState(() => {
        if (!amount || amount === '0')
            return ''
        return amount
    }, [amount])
    const predefinedAssets = balances.map(b => b.id).filter(a => {
        if (filterBalances === 'pools' && !isValidPoolId(a))
            return false
        if (filterBalances === 'assets' && isValidPoolId(a))
            return false
        return true
    })

    if (!predefinedAssets.length) {
        predefinedAssets.push('XLM')
    }

    function change(e) {
        const v = e.target.value.replace(/[^\d.]/g, '')
        setInputAmount(v)
        try {
            const amt = fromStroops(toStroops(v))
            settings.setAmount(amt, index)
        } catch (e) {
            settings.setAmount('0', index)
        }
    }

    function onAssetChange(asset) {
        if (assetSelectorDisabled)
            return
        settings.setAsset(asset, index)
    }

    const style = {}
    if (error) {
        style.borderColor = 'var(--color-alert)'
    }
    const selectedAsset = settings.asset[index]
    return <div className="transfer-amount relative">
        <input type="text" value={inputAmount} onChange={change} placeholder={placeholder || '0'} style={style} data-lpignore="true"
               ref={autofocus ? useAutoFocusRef : undefined} maxLength="21" readOnly={readOnly || false}/>
        <AssetSelector value={selectedAsset} onChange={onAssetChange} predefinedAssets={predefinedAssets} restricted={restricted}/>
        {profit > 0 && <div>
            <div className="profit">
                <span className="amount-clone">{inputAmount}</span>
                <span className="text-tiny color-success condensed">
                    +{formatWithAutoPrecision(profit)}&thinsp;{(selectedAsset || '').split('-')[0]}
                    <span className="desktop-only">
                        (+{formatWithAutoPrecision(parseFloat(profit) * 100 / parseFloat(inputAmount))}%)
                    </span>
                </span>
            </div>
        </div>}
    </div>
}

TransferAmountView.propTypes = {
    //settings container
    settings: PropTypes.shape({
        asset: PropTypes.arrayOf(PropTypes.string),
        amount: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    //positional index of the transfer control
    index: PropTypes.number,
    //existing account balances
    balances: PropTypes.arrayOf(PropTypes.object),
    //balance filtering conditions
    filterBalances: PropTypes.oneOf(['all', 'assets', 'pools']),
    //if set available assets list restricted to existing trustlines only
    restricted: PropTypes.bool,
    //input placeholder text
    placeholder: PropTypes.string,
    //automatically focus on this input when the control is loaded
    autofocus: PropTypes.bool,
    //whether the input can be edited
    readOnly: PropTypes.bool,
    //whether the asset selector can change asset
    assetSelectorDisabled: PropTypes.bool,
    error: PropTypes.bool
}

export default observer(TransferAmountView)