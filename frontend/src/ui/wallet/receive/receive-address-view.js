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
        <div className="text-center text-small micro-space">
            <BlockSelect style={{maxWidth: '100%'}} className="text-monospace condensed">
                <span>{publicKey.substring(0, 28)}</span>
                <wbr/>
                <span>{publicKey.substring(28)}</span>
            </BlockSelect>
            <CopyToClipboard text={publicKey}>
                <a href="#" className="icon-copy active-icon" title="Copy account address"/>
            </CopyToClipboard>
        </div>
        <div className="space">
            <QrCodeView value={publicKey}/>
        </div>
    </>
})