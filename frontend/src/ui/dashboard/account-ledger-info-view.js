import React from 'react'
import PropTypes from 'prop-types'
import AccountBalanceView from './account-balance-view'
import {observer} from 'mobx-react'
import AccountLedgerData from '../../state/account-ledger-data'

function AccountLedgerDataView({ledgerData}) {
    if (!ledgerData) return null
    if (ledgerData.error && !ledgerData.nonExisting) return <div className="text-small error">
        <i className="fa fa-warning"/> {ledgerData.error}
    </div>
    return <>
        <AccountBalanceView {...ledgerData}/>
    </>
}

AccountLedgerDataView.propTypes = {
    ledgerData: PropTypes.instanceOf(AccountLedgerData).isRequired
}

export default observer(AccountLedgerDataView)