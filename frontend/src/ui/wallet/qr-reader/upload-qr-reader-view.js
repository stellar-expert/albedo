import React from 'react'
import {BrowserQRCodeReader} from '@zxing/browser'
import './upload-qr-overlay.scss'
import WalletPageActionDescription from '../shared/wallet-page-action-description'

export default function UploadQrReaderView({onChange}) {
    function selectFile(e) {
        const [file] = e.target.files
        if (file) {
            const img = URL.createObjectURL(file)
            const codeReader = new BrowserQRCodeReader(null)
            codeReader.decodeFromImageUrl(img)
                .then(res => onChange({parsed: res.text}))
                .catch(e => {
                    console.error(e)
                    onChange({error: 'Failed to locate QR core on the uploaded image'})
                })
        }
    }

    return <>
        <WalletPageActionDescription>
            upload QR screenshot if camera is not available
        </WalletPageActionDescription>
        <div className="qr-overlay text-center space">
            <div className="v-center-block upload-block">
                <div>
                    <span className="icon icon-qr dimmed" style={{fontSize: '2em'}}/>
                    <div className="text-small dimmed">
                        Drop QR screenshot here, or click to upload
                    </div>
                </div>
            </div>
            <input type="file" placeholder="Choose image" onChange={selectFile} className="overlay" style={{opacity: 0.01}}/>
        </div>
    </>
}