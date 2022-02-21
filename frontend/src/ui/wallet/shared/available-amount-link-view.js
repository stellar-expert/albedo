import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import Bignumber from 'bignumber.js'
import {AssetDescriptor, formatWithPrecision, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {estimateFee} from '../../../util/fee-estimator'

function AvailableAmountLink({settings, index}) {
    const network = useStellarNetwork(),
        asset = settings.asset[index],
        [availableBalance, setAvailableBalance] = useState(accountLedgerData.getAvailableBalance(asset))

    useEffect(() => {
        setAvailableBalance(accountLedgerData.getAvailableBalance(asset))
        if (asset !== 'XLM') return
        estimateFee(network)
            .then(fee => {
                const adjustedFee = new Bignumber(fee).div(10000000).toFixed(7)
                setAvailableBalance(accountLedgerData.getAvailableBalance(asset, adjustedFee))
            })
    }, [network, accountLedgerData.balances[asset]])

    function setMax() {
        settings.setAmount(availableBalance, index)
    }

    return <div className="dimmed condensed text-tiny text-right" style={{paddingTop: '0.2em'}}>
        <a className="dimmed" href="#" onClick={setMax}>
            {formatWithPrecision(availableBalance, 7)} {AssetDescriptor.parse(asset).toCurrency()} available
        </a>
    </div>
}

AvailableAmountLink.propTypes = {
    settings: PropTypes.shape({asset: PropTypes.arrayOf(PropTypes.string), setAmount: PropTypes.func}).isRequired,
    index: PropTypes.number.isRequired
}

export default observer(AvailableAmountLink)