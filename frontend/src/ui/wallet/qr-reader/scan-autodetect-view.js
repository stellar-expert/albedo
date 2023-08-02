import React from 'react'
import {StrKey} from 'stellar-sdk'
import {navigation} from '@stellar-expert/navigation'
import {Tabs} from '@stellar-expert/ui-framework'
import {validateWCLink} from '../../wallet-connect/pairing/wc-link-validator'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import {CameraQrReaderView} from './camera-qr-reader-view'
import UploadQrReaderView from './upload-qr-reader-view'

function onScan({parsed, error}) {
    if (error) {
        notify({type: 'error', message: error})
        return
    }
    if (!parsed)
        return
    if (StrKey.isValidEd25519PublicKey(parsed) || StrKey.isValidMed25519PublicKey(parsed))
        return navigation.navigate('/wallet/transfer?destination=' + parsed)
    if (validateWCLink(parsed))
        return navigation.navigate('/wallet-connect/connect?pairingRequest=' + parsed)
    if (/^web\+stellar:/.test(parsed))
        return navigation.navigate(`/web-stellar-handler?sep0007link=${encodeURIComponent(parsed + '&wallet_redirect=/')}`)
}

function CameraScanAutodetectView() {
    return <CameraQrReaderView onChange={onScan} requestText="scan Stellar address, payment request, WalletConnect QR"/>
}

const tabs = [
    {
        name: 'camera',
        title: 'Scan',
        isDefault: true,
        render: () => <CameraScanAutodetectView/>
    },
    {
        name: 'upload',
        title: 'Upload',
        render: () => <UploadQrReaderView onChange={onScan}/>
    }
]

export default function ScanAutodetectView() {
    return <WalletOperationsWrapperView title="Scan QR code" allowNonExisting>
        <Tabs tabs={tabs} right/>
    </WalletOperationsWrapperView>
}