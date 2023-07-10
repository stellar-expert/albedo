import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {CopyToClipboard, useStellarNetwork} from '@stellar-expert/ui-framework'
import AccountManager from '../../../state/account-manager'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import QrCodeView from '../../components/qr-code-view'
import TxMemoView from '../tx/tx-memo-view'
import TransferAmountView from '../shared/transfer-amount-view'
import ReceiveRequestSettings from './receive-request-settings'
import WalletPageActionDescription from '../shared/wallet-page-action-description'

export default observer(function ReceiveRequestView() {
    const network = useStellarNetwork()
    const {publicKey} = AccountManager.activeAccount
    const balances = accountLedgerData.balancesWithPriority
    const [transfer, setTransfer] = useState(null)
    useEffect(() => {
        setTransfer(new ReceiveRequestSettings(publicKey, network))
    }, [publicKey, network])

    if (!transfer)
        return null
    const sep7link = transfer.generateSep7Link()

    return <>
        <WalletPageActionDescription>
            request a payment with fixed amount and currency
        </WalletPageActionDescription>
        {accountLedgerData.nonExisting ?
            <div className="segment space text-center text-small condensed">
                <div className="space">
                    <i className="icon-warning"/> Account doesn't exist on the ledger and cannot receive payments.
                    <br/>
                    Fund it with some XLM to unlock all wallet functions.
                </div>
                <div className="space"/>
            </div> :
            <>
                <div className="segment space">
                    <div>
                        <TransferAmountView placeholder="Amount of tokens" settings={transfer} balances={balances} index={0} restricted
                                            autofocus/>
                    </div>
                    <TxMemoView transfer={transfer}/>
                </div>
                <div className="space">
                    <QrCodeView value={sep7link}/>
                </div>
                <div className="text-tiny text-center space">
                    <CopyToClipboard text={sep7link}>
                        <a href="#">Copy request payment link <i className="icon-copy active-icon"/></a>
                    </CopyToClipboard>
                </div>
            </>}

    </>
})