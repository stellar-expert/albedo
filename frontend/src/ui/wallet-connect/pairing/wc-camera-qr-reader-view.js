import React, {useEffect, useRef, useState} from 'react'
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

/**
 * Check if a user enabled camera access
 * @return {Promise<"denied"|"granted"|"prompt">}
 */
function checkCameraPermission() {
    return navigator.permissions.query({name: 'camera'}).then(res => res.state)
}

/**
 * Try to start camera stream to check whether everything is working
 * @return {Promise}
 */
function checkCameraStream() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(videoConstraints)
            .then((stream) => {
                stream.getTracks().forEach(track => track.stop())
                resolve()
            })
            .catch((err) => {
                switch (err.name) {
                    case 'NotAllowedError':
                        reject('blocked')
                        break
                    case 'NotFoundError':
                        reject('unavailable')
                        break
                    default:
                        reject('unknown-error')
                }
            })
    })
}

export default function WcCameraQrReaderView({onChange}) {
    const [accessStatus, setAccessStatus] = useState('')
    const [error, setError] = useState()
    const previewRef = useRef()

    function pollPermissions() {
        checkCameraPermission()
            .then(res => setAccessStatus(res))
    }

    function tryInitStream() {
        checkCameraStream()
            .then(() => setAccessStatus('granted'))
            .catch(e => setError(e))
    }

    useEffect(() => {
        if (accessStatus !== 'granted') {
            tryInitStream()
            const permissionPollInterval = setInterval(pollPermissions, 1000)
            return () => clearInterval(permissionPollInterval)
        }
        const codeReader = new BrowserQRCodeReader(null, {
            delayBetweenScanAttempts: 700
        })
        let decoderControls
        codeReader.decodeFromConstraints(videoConstraints, previewRef.current, (res, e) => {
            if (e) {
                if (e.name === 'NotFoundException') return
                console.error(e)
            } else {
                onChange({parsed: res.text})
            }
        })
            .then(controls => decoderControls = controls)
            .catch(e => console.error(e))

        return () => decoderControls?.stop()
    }, [accessStatus])

    if (!accessStatus) return <div className="loader"/>
    if (error === 'unavailable')
        return <CameraErrorView>
            <div>
                No suitable video camera device detected
            </div>
            <div>
                Please turn on camera and refresh this page
            </div>
        </CameraErrorView>

    if (accessStatus === 'denied' || error === 'NotAllowed')
        return <CameraErrorView>
            <div>
                Camera access on this device is blocked
            </div>
            <div className="text-small micro-space">
                Learn how to unblock it <a href="https://help.daily.co/en/articles/2528184-unblock-camera-mic-access-on-a-computer"
                                           target="_blank" rel="nofollow noreferrer">here</a>
            </div>
        </CameraErrorView>

    if (accessStatus === 'granted')
        return <div>
            <div className="wc-connect-overlay">
                <video muted className="wc-qr-camera-preview" ref={previewRef} style={{width: '100%'}}/>
                <div className="overlay" style={{border: '60px solid rgba(20,20,20,0.4)'}}/>
            </div>
            <p className="dimmed text-small text-center space">Scan QR code on the application website</p>
        </div>

    if (accessStatus === 'prompt')
        return <CameraErrorView blocked={false}>
            We need access to the camera on this device to read a connection QR code.
            Please confirm the browser request.
        </CameraErrorView>
    return null
}

function CameraErrorView({children, blocked = true}) {
    return <div className="v-center-block text-center" style={{minHeight: '1vmin'}}>
        <div>
            <div style={{fontSize: '2em'}}>
                <span className="icon icon-qr color-warning"/>
                {blocked && <span className="color-danger"
                                  style={{
                                      display: 'inline-block',
                                      position: 'absolute',
                                      margin: '-0.3em -0.6em',
                                      fontSize: '1.5em'
                                  }}>/</span>}
            </div>
            <div className="dimmed">
                {children}
            </div>
        </div>
    </div>
}