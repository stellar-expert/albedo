import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import actionContext from '../../state/action-context'
import {isTestnet} from '../../util/network-resolver'
import standardErrors from '../../util/errors'
import {requestFriendbotFunding} from '../../util/horizon-connector'

export default observer(function AccountFundingStatusView() {
    const {selectedAccount, selectedAccountInfo, intentParams, requiresExistingAccount} = actionContext,
        [fundingInProgress, setFundingInProgress] = useState(false),
        selectedPublicKey = selectedAccount?.publicKey

    useEffect(() => {
        if (!requiresExistingAccount) return
        actionContext.loadSelectedAccountInfo()
        const updateInfoIntervalHandler = setInterval(() => {
            const {selectedAccountInfo} = actionContext
            if (selectedAccountInfo && !selectedAccountInfo.error) {
                clearInterval(updateInfoIntervalHandler)
                return
            }
            actionContext.loadSelectedAccountInfo()
        }, 10000) //update info every 10 seconds
        return () => clearInterval(updateInfoIntervalHandler)
    }, [selectedPublicKey, requiresExistingAccount])

    function createTestnetAccount() {
        setFundingInProgress(true)
        requestFriendbotFunding(selectedPublicKey)
            .then(() => actionContext.loadSelectedAccountInfo()
                .finally(() => setFundingInProgress(false)))
            .finally(() => setFundingInProgress(false))
    }

    if (!requiresExistingAccount) return null

    if (!selectedAccountInfo || fundingInProgress) return <div className="loader"/>
    const {error} = selectedAccountInfo
    if (error && error.code !== standardErrors.accountNotSelected.code) return <div>
        {error.text}
        {error.code === standardErrors.accountDoesNotExist.code && <div className="segment segment-inline warning text-small">
            {isTestnet(intentParams) ? <>
                    The account does not exist on the ledger. We can create a <b>testnet</b> account for you.{' '}
                    <a href="#" onClick={createTestnetAccount}>Create it now?</a>
                </> :
                <>
                    The account does not exist on the ledger. You need to create it before usage – send at least 2 XLM
                    to the address{' '}
                    <AccountAddress account={selectedPublicKey} chars={56} className="word-break condensed"
                                    copyToClipboard/>
                </>}
            <div className="micro-space"/>
        </div>}
    </div>
    return null
})