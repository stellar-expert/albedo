import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import {isTestnet} from '../../util/network-resolver'
import AccountAddress from '../components/account-address'
import standardErrors from '../../util/errors'
import {requestFriendbotFunding} from '../../util/horizon-connector'

function AccountFundingStatusView() {
    const {selectedPublicKey, selectedAccountInfo, intent, intentParams, requiresExistingAccount} = actionContext,
        [fundingInProgress, setFundingInProgress] = useState(false)
    if (!requiresExistingAccount) return null
    useEffect(() => {
        actionContext.loadSelectedAccountInfo()
        const updateInfoIntervalHandler = setInterval(() => {
            if (actionContext.selectedAccountInfo && !actionContext.selectedAccountInfo.error) {
                clearInterval(updateInfoIntervalHandler)
                return
            }
            actionContext.loadSelectedAccountInfo()
        }, 10000) //update info every 10 seconds
        return () => {
            clearInterval(updateInfoIntervalHandler)
        }
    }, [selectedPublicKey])

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(selectedPublicKey)
            .then(() => actionContext.loadSelectedAccountInfo()
                .finally(() => setFundingInProgress(false)))
            .finally(() => setFundingInProgress(false))
    }

    if (!selectedAccountInfo || fundingInProgress) return <div className="loader"/>
    const {error} = selectedAccountInfo
    if (error && error.code !== standardErrors.accountNotSelected.code) return <div>
        {error.text}
        {error.code === standardErrors.accountDoesNotExist.code && <div className="warning-block text-small">
            {isTestnet(intentParams) ? <>
                    The account doesn't exist on the ledger. We can create a <b>testnet</b> account for you.{' '}
                    <a href="#" onClick={createTestnetAccount}>Create it now?</a>
                </> :
                <>
                    The account doesn't exist on the ledger. You need to create it before usage – send at least 2 XLM to
                    the address{' '}
                    <AccountAddress account={selectedPublicKey} chars={56} className="word-break text-condensed"
                                    copyToClipboard/>
                </>
            }
        </div>}
    </div>
    return null
}

export default observer(AccountFundingStatusView)