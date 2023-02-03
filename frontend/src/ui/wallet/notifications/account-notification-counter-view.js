import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import './noification-counter.scss'

function AccountNotificationCounterView({type}) {
    const counter = accountLedgerData?.notificationCounters?.counters?.[type] || 0
    if (counter === 0)
        return null
    return <span className="notification-counter icon-bell-notifications"/>
}

AccountNotificationCounterView.propTypes = {
    type: PropTypes.oneOf(['op', 'cb']).isRequired
}

export default observer(AccountNotificationCounterView)