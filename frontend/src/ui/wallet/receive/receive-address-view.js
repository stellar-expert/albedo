import React from 'react'
import {observer} from 'mobx-react'
import {BlockSelect, CopyToClipboard} from '@stellar-expert/ui-framework'
import AccountManager from '../../../state/account-manager'
import QrCodeView from '../../components/qr-code-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'

export default observer(function ReceiveAddressView() {
    const {publicKey} = AccountManager.activeAccount
    return <>
        <WalletPageActionDescription>
            share your account address to receive a payment
        </WalletPageActionDescription>
        <div className="space">
            <QrCodeView value={publicKey}/>
        </div>
        <div className="text-center text-tiny space">
            <BlockSelect style={{overflow: 'hidden', maxWidth: '100%'}} className="text-monospace condensed">{publicKey}</BlockSelect>
            <div>
                <CopyToClipboard text={publicKey}>
                    <a href="#">Copy account address<i className="icon-copy active-icon"/></a>
                </CopyToClipboard>
            </div>
        </div>
    </>
})