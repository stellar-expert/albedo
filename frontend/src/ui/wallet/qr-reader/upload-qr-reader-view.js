import React, {useCallback} from 'react'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import scanQrCodeFromCanvas from './scan-qr-code-from-canvas'
import './upload-qr-overlay.scss'

export default function UploadQrReaderView({onChange}) {
    const selectFile = useCallback(e => {
        const [file] = e.target.files
        if (file) {
            const img = new Image()
            img.src = URL.createObjectURL(file)

            img.decode()
                .then(() => {
                    const parsed = scanQrCodeFromCanvas(img)
                    if (parsed) {
                        onChange({parsed})
                    } else {
                        onChange({error: 'Failed to locate QR core on the uploaded image'})
                    }
                })
                .catch(() => {
                    onChange({error: 'Failed to locate QR core on the uploaded image'})
                })
        }
    }, [onChange])

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