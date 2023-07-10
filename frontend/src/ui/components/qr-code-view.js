import React from 'react'
import {QrCode} from '@stellar-expert/ui-framework'

//TODO: Add export QR code image function once the new qrcode.react version is released (currently forwardRef is missing)

export default function QrCodeView({value, size = 320}) {
    return <QrCode value={value} size={size} embeddedImage="/img/logo-square.svg" embeddedSize={36} />
}