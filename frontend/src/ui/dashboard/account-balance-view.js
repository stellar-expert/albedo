import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import cn from 'classnames'
import Amount from '../components/amount'
import AccountLedgerData from '../../state/account-ledger-data'
import {formatAssetUnifiedLink} from '../../util/formatter'

@observer
class AccountBalanceView extends React.Component {
    state = {
        accountData: null
    }

    static propTypes = {
        address: PropTypes.string.isRequired
    }

    componentDidMount() {
        const data = new AccountLedgerData(this.props.address)
        data.sync()
            .catch(e => console.error(e))
        this.setState({accountData: data})
    }

    render() {
        const {accountData} = this.state
        if (!accountData || !accountData.loaded) return null
        if (accountData.nonExisting) return <div className="dimmed text-small">
            (Balances unavailable - account doesn't exist on the ledger)
        </div>
        return <div>
            {accountData.balances.map(balance => {
                const asset = formatAssetUnifiedLink({code: balance.asset_code, issuer: balance.asset_issuer})
                return <span key={asset}>
                <Amount amount={balance.balance} asset={asset}/>
            </span>
            })}
        </div>
    }
}

export default AccountBalanceView