import React, {useEffect} from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import {isTestnet} from '../../util/network-resolver'
import AccountAddress from '../components/account-address'

function AccountFundingStatusView() {
    const {selectedPublicKey, selectedAccountInfo, intentParams, requiresExistingAccount} = actionContext
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
    if (!selectedAccountInfo) return <div className="loader"/>
    const {error} = selectedAccountInfo
    if (error) return <div>
        {error.text}
        {error.code === 404 && <div className="warning-block text-small">
            {isTestnet(intentParams) ? <>
                    Please wait, automatic testnet account creation requested.
                    <div className="loader small"/>
                </> :
                <>
                    You need to create an account before using it – send at least 2 XLM to address{' '}
                    <AccountAddress account={selectedPublicKey} chars={56} className="word-break text-condensed" copyToClipboard/>
                </>
            }
        </div>}
    </div>
    return null
}

export default observer(AccountFundingStatusView)