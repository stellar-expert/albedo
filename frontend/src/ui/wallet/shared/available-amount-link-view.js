import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {fromStroops, formatWithPrecision} from '@stellar-expert/formatter'
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
                setAvailableBalance(accountLedgerData.getAvailableBalance(asset, fromStroops(fee)))
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