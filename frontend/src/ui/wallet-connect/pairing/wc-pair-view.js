import React, {useEffect, useState} from 'react'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {Tabs} from '@stellar-expert/ui-framework'
import {CameraQrReaderView} from '../../wallet/qr-reader/camera-qr-reader-view'
import UploadQrReaderView from '../../wallet/qr-reader/upload-qr-reader-view'
import WalletOperationsWrapperView from '../../wallet/shared/wallet-operations-wrapper-view'
import walletConnect from '../wallet-connect-adapter'
import {validateWCLink} from './wc-link-validator'
import WcDirectLinkView from './wc-direct-link-view'
import WcPairingConfirmationView from './wc-pairing-confirmation-view'

export default function WcPairView() {
    const [error, setError] = useState('')
    const [pairingRequest, setPairingRequest] = useState()

    function initPairing(pairingRequest) {
        walletConnect.initPairing(pairingRequest) //, accountManager.activeAccount.publicKey
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

    useEffect(() => {
        const {pairingRequest} = parseQuery()
        if (pairingRequest) {
            navigation.updateQuery({pairingRequest: undefined})
            initPairing(pairingRequest)
        }
    }, [])

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
        initPairing(parsed)

    }

    const tabs = [
        {
            name: 'camera',
            title: 'Scan',
            isDefault: true,
            render: () => <CameraQrReaderView onChange={onChange} requestText="Scan QR code on the application website"/>
        },
        {
            name: 'upload',
            title: 'Upload',
            render: () => <UploadQrReaderView onChange={onChange}/>
        },
        {
            name: 'input',
            title: 'Copy',
            render: () => <WcDirectLinkView onChange={onChange}/>
        }
    ]

    return <WalletOperationsWrapperView title={<span style={{textTransform: 'none'}}>WalletConnect</span>}>
        <Tabs tabs={tabs} right/>
        {!!error && <div className="error space text-small">
            {error}
        </div>}
    </WalletOperationsWrapperView>
}