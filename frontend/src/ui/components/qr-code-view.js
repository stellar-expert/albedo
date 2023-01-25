import React from 'react'
import {QRCodeCanvas} from 'qrcode.react'

const imageSettings = {
    src: '/img/logo-square.svg',
    height: 36,
    width: 36,
    excavate: true
}

//TODO: Add export QR code image function once the new qrcode.react version is released (currently forwardRef is missing)

export default function QrCodeView({value, size = 320}) {
    const foreground = getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
    return <QRCodeCanvas value={value} fgColor={foreground} size={size} level="Q" imageSettings={imageSettings}
                         includeMargin style={{width: size + 'px', display: 'block', margin: 'auto'}}/>
}