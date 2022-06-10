import React, {useEffect, useRef} from 'react'
import {BrowserQRCodeReader} from '@zxing/browser'
import './wc-camera-qr-reader.scss'

const videoConstraints = {
    audio: false,
    video: {
        facingMode: {
            ideal: 'environment'
        }
    }
}

export default function WcCameraQrReaderView({onSuccess}) {
    const previewRef = useRef()

    function onScan(res) {
        if (/wc:\w+@2/.test(res)) { //valid link
            onSuccess(res)
        } else {
            //invalid - wrong qr //TODO: show notification
        }
    }

    useEffect(() => {
        const codeReader = new BrowserQRCodeReader(null, {
            delayBetweenScanAttempts: 700
        })
        let decoderControls
        codeReader.decodeFromConstraints(videoConstraints, previewRef.current, (res, e) => {
            if (e) {
                console.error(e)
            } else {
                onScan(res)
            }
        })
            .then(controls => decoderControls = controls)
            .catch(e => console.error(e))

        return () => decoderControls?.stop()
    }, [])

    return <div>
        <video muted className="wc-qr-camera-preview" ref={previewRef}/>
    </div>
}