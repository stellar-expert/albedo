import React from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import {AssetDescriptor} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

function AvailableAmountLink({settings, index}) {
    const {balances} = accountLedgerData,
        availableABalance = accountLedgerData.getAvailableBalance(settings.asset[index])

    function setMax() {
        settings.setAmount(availableABalance, index)
    }

    return <div className="dimmed condensed text-tiny text-right" style={{paddingTop: '0.2em'}}>
        <a className="dimmed" href="#" onClick={setMax}>
            {availableABalance} {AssetDescriptor.parse(settings.asset[index]).toCurrency()} available
        </a>
    </div>
}

AvailableAmountLink.propTypes = {
    settings: PropTypes.shape({asset: PropTypes.arrayOf(PropTypes.string), setAmount: PropTypes.func}).isRequired,
    index: PropTypes.number.isRequired
}

export default observer(AvailableAmountLink)