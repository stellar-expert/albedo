import React from 'react'
import {BrowserQRCodeReader} from '@zxing/browser'
import './wc-camera-qr-reader.scss'
import './wc-connect.scss'

export default function WcUploadQrView({onChange}) {
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

    return <div>
        <div className="wc-connect-overlay  text-center">
            <div className="v-center-block" style={{height: '200px', border: '4px solid #ccc', cursor: 'pointer'}}>
                <div>
                    <span className="icon icon-qr dimmed" style={{fontSize: '2em'}}/>
                    <div className="text-small dimmed">
                        Drop QR screenshot here, or click to upload
                    </div>
                </div>
            </div>
            <input type="file" placeholder="Choose image" onChange={selectFile} className="overlay" style={{opacity: 0.01}}/>
        </div>
        <p className="dimmed text-small text-center space">Upload a QR screenshot if camera is not available</p>
    </div>
}