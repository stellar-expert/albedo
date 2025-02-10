import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {formatWithAutoPrecision, fromStroops, toStroops} from '@stellar-expert/formatter'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

function AvailableAmountLink({settings, index, trading = false}) {
    const network = useStellarNetwork()
    const asset = settings.asset[index]
    const [availableBalance, setAvailableBalance] = useState(getBalance(asset))

    useEffect(() => {
        setAvailableBalance(getBalance(asset, trading))
    }, [network, accountLedgerData.balances[asset], trading])

    function setAmount(e) {
        const percentage = BigInt(e.target.dataset.balance)
        let amount = availableBalance
        if (percentage !== 100n) {
            amount = fromStroops(toStroops(availableBalance) * percentage / 100n)
        }
        settings.setAmount(amount, index)
    }

    return <div className="dimmed condensed text-tiny text-right" style={{paddingTop: '0.2em'}}>
        <a className="dimmed" href="#" onClick={setAmount} data-balance={100}>
            {formatWithAutoPrecision(availableBalance)} {AssetDescriptor.parse(asset).toCurrency()}
        </a>&emsp;
        <a href="#" onClick={setAmount} data-balance={25}>25%</a>{' / '}
        <a href="#" onClick={setAmount} data-balance={50}>50%</a>
        <span className="desktop-only">{' / '}
            <a href="#" onClick={setAmount} data-balance={100}>100%</a>
        </span>
    </div>
}

function getBalance(asset, trading) {
    const res = accountLedgerData.getAvailableBalance(asset, trading && asset === 'XLM' ? 1 : 0)
    if (parseFloat(res) < 0)
        return '0'
    return res
}

AvailableAmountLink.propTypes = {
    settings: PropTypes.shape({asset: PropTypes.arrayOf(PropTypes.string), setAmount: PropTypes.func}).isRequired,
    index: PropTypes.number.isRequired
}

export default observer(AvailableAmountLink)