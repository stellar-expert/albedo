import React from 'react'
import PropTypes from 'prop-types'
import {useDependantState} from '../../state/state-hooks'
import {createHorizon} from '../../util/horizon-connector'
import AccountBalanceView from './account-balance-view'
import {useStellarNetwork} from '../../state/network-selector'

function AccountLedgerDataView({address}) {
    const currentNetwork = useStellarNetwork()
    const [accountData, setAccountData] = useDependantState(() => {
        if (!address) return {
            error: 'Invalid account address',
            nonExisting: true
        }
        const horizon = createHorizon({network: currentNetwork})
        horizon.loadAccount(address)
            .then(({balances, thresholds, signers}) => {
                setAccountData({
                    balances,
                    thresholds,
                    signers
                })
            })
            .catch(e => {
                if (e.name === 'NotFoundError') {
                    setAccountData({
                        error: 'Account does not exist on the ledger',
                        nonExisting: true
                    })
                } else {
                    console.error(e)
                    setAccountData({
                        error: 'Failed to load account data from Horizon'
                    })
                }
            })
    }, [address, currentNetwork])

    if (!accountData) return null
    if (accountData.error && !accountData.nonExisting) return <div className="text-small error">
        <i className="fa fa-warning"/> {accountData.error}
    </div>
    return <>
        <AccountBalanceView {...accountData}/>
    </>
}

AccountLedgerDataView.propTypes = {
    address: PropTypes.string.isRequired
}

export default AccountLedgerDataView