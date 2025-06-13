import React from 'react'
import {AccountAddress, getCurrentStellarNetwork} from '@stellar-expert/ui-framework'
import {formatWithAutoPrecision} from '@stellar-expert/formatter'
import {fetchAssetPrices} from '../../../state/ledger-data/asset-price'

const threshold = 200

/**
 * @param {'swap'|'transfer'|'deposit'} kind
 * @param {string} asset
 * @param {string} amount
 * @param {string} [buyingAsset]
 * @param {string} [destination]
 * @param {string} [memo]
 * @return {Promise}
 */
export function confirmSpending({kind, asset, amount, buyingAsset, destination, memo}) {
    return new Promise((resolve, reject) =>
        fetchAssetPrices(getCurrentStellarNetwork(), [asset])
            .then(prices => {
                const estimatedPrice = Object.values(prices)[0]
                const value = amount * estimatedPrice
                if (value > threshold) {
                    confirm(<ConfirmBalanceActionView {...{kind, asset, amount, value, buyingAsset, destination, memo}}/>, {
                        title: 'Confirm transaction',
                        icon: 'hexagon-set-options'
                    })
                        .then(resolve)
                        .catch(reject)
                } else {
                    resolve()
                }
            }).catch(e => reject(e)))
}

function ConfirmBalanceActionView({kind, asset, amount, value, buyingAsset, destination, memo}) {
    const estimatedText = `(~${formatWithAutoPrecision(value)}$)`
    if (kind === 'swap')
        return <div className="space">
            Swap {amount}&thinsp;{getAssetCode(asset)} {estimatedText}?
        </div>
    if (kind === 'deposit')
        return <div className="space">
            Deposit assets (~{formatWithAutoPrecision(value * 2)}$) to liquidity pool?
        </div>
    return <div className="space">
        Transfer {amount}&thinsp;{getAssetCode(asset)} {estimatedText}&thinsp;→&thinsp;
        <AccountAddress account={destination}/>?
        {!!(memo?.value) && <div className="dimmed text-tiny nowrap">{`(memo: ${memo.value})`}</div>}
    </div>
}

function getAssetCode(asset) {
    return asset.split('-')[0]
}