import React, {useState} from 'react'
import {Tabs} from '@stellar-expert/ui-framework'
import WcCameraQrReaderView from './wc-camera-qr-reader-view'
import WcUploadQrView from './wc-upload-qr-view'
import WcDirectLinkView from './wc-direct-link-view'
import {validateWCLink} from './wc-link-validator'
import walletConnect from '../wallet-connect-adapter'
import WcPairingConfirmationView from './wc-pairing-confirmation-view'

export default function WcPairView() {
    const [error, setError] = useState('')
    const [pairingRequest, setPairingRequest] = useState()

    if (pairingRequest)
        return <WcPairingConfirmationView pairingRequest={pairingRequest}/>

    function onChange({parsed, error}) {
        if (error) {
            setError(error)
            return
        }
        if (!validateWCLink(parsed)) {
            setError('Invalid WalletConnect link')
            return
        }
        setError('')
        walletConnect.initPairing(parsed) //, accountManager.activeAccount.publicKey
            .then(approved => {
                setPairingRequest(approved)
                console.log(approved)
                //navigation.navigate('/wallet-connect/request')
            })
            .catch(err => {
                setError('Failed to pair with dapp')
                console.error(err)
            })
    }

    const tabs = [
        {
            name: 'camera',
            title: 'Scan QR code',
            isDefault: true,
            render: () => <WcCameraQrReaderView onChange={onChange}/>
        },
        {
            name: 'upload',
            title: 'Upload QR code',
            render: () => <WcUploadQrView onChange={onChange}/>
        },
        {
            name: 'input',
            title: 'Provide code',
            render: () => <WcDirectLinkView onChange={onChange}/>
        }]

    return <div>
        <h2>Connect to WalletConnect app</h2>
        <Tabs tabs={tabs}/>
        {!!error && <div className="error space text-small">
            {error}
        </div>}
    </div>
}