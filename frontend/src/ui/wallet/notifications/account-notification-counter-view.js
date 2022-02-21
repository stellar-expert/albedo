import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

function AccountNotificationCounterView({type}) {
    const {notificationCounters = {}} = accountLedgerData,
        {counters = {}} = notificationCounters,
        counter = counters[type]
    if (!(counter > 0)) return null

    return <span className="notification-counter">{counter > 99 ? '99+' : counter}</span>
}

AccountNotificationCounterView.propTypes = {
    type: PropTypes.oneOf(['op', 'cb']).isRequired
}

export default observer(AccountNotificationCounterView)