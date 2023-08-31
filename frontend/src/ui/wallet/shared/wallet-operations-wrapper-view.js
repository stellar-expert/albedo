import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import ActionLoaderView from './action-loader-view'
import './wallet.scss'

/**
 * @param {String} title
 * @param {Boolean} allowNonExisting?
 * @param {*} children
 * @constructor
 */
function WalletOperationsWrapperView({title, allowNonExisting, children}) {
    const renderChildren = !accountLedgerData.nonExisting || allowNonExisting
    const network = useStellarNetwork()
    const [fundingInProgress, setFundingInProgress] = useState(false)

    const createTestnetAccount = useCallback(() => {
        setFundingInProgress(true)
        requestFriendbotFunding(accountLedgerData.address)
            .then(() => new Promise(r => setTimeout(r, 6000)))
            .then(() => accountLedgerData.loadAccountInfo())
            .finally(() => setFundingInProgress(false))
    }, [])

    return <div className="wallet-operations space">
        {!!title && <h3 className="space">{title}</h3>}
        {accountLedgerData.loaded ?
            <>
                {accountLedgerData.nonExisting && !fundingInProgress && !allowNonExisting && <>
                    <div className="segment warning space text-tiny text-center">
                        Account doesn't exist on the ledger.
                        <br/>
                        You need to <a href="/wallet/receive">fund it</a> with XLM in order to send/receive assets.
                        {network === 'testnet' && <div>
                            <a href="#" onClick={createTestnetAccount}>Fund test account automatically?</a>
                        </div>}
                    </div>
                    <div className="space"/>
                </>}
                {!!fundingInProgress && <ActionLoaderView message="creating account"/>}
                {renderChildren && <>{children}</>}
            </> :
            <ActionLoaderView message="loading account info"/>}
    </div>
}

export default observer(WalletOperationsWrapperView)