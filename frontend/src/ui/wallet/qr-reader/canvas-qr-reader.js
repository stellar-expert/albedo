import {BrowserQRCodeReader} from '@zxing/browser'

const padding = 20
const enoughWidthQRCode = 600 //enough resolution for detecting QR code

export default function CanvasQRReader(source) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', {willReadFrequently: true})
    const width = source.videoWidth || source.width
    const height = source.videoHeight || source.height
    const increaseFactor = (width >= enoughWidthQRCode) ? Math.floor(width / enoughWidthQRCode) : Math.ceil(enoughWidthQRCode / width)
    const imgWidth = width * increaseFactor || enoughWidthQRCode
    const imgHeight = height * increaseFactor || enoughWidthQRCode
    //Change size of image
    canvas.width = imgWidth
    canvas.height = imgHeight
    context.drawImage(source, 0, 0, imgWidth, imgHeight)
    const sourceData = context.getImageData(0, 0, imgWidth, imgHeight)
    //apply brightness filter, helpful for more cases
    let result = QRScaner(canvas, context, canvasBrightness(sourceData))
    if (result.text)
        return result
    //Change size of image
    canvas.width = imgWidth
    canvas.height = imgHeight
    context.drawImage(source, 0, 0, imgWidth, imgHeight)
    const sourceData2 = context.getImageData(0, 0, imgWidth, imgHeight)
    //apply contrast filter if the first didn't give result
    result = QRScaner(canvas, context, canvasContrast(sourceData2))
    return result
}

function canvasContrast(sourceData) {
    const src = new Uint32Array(sourceData.data.buffer)
    const delta = 1
    let avgGray = 0
    for (let i = 0; i < src.length; i++) {
        const r = src[i] & 0xFF
        const g = (src[i] >> 8) & 0xFF
        const b = (src[i] >> 16) & 0xFF
        avgGray += (r * 0.2126 + g * 0.7152 + b * 0.0722)
    }
    avgGray /= src.length

    for (let i = 0; i < src.length; i++) {
        let r = src[i] & 0xFF
        let g = (src[i] >> 8) & 0xFF
        let b = (src[i] >> 16) & 0xFF

        r += (r - avgGray) * delta
        g += (g - avgGray) * delta
        b += (b - avgGray) * delta

        if (r > 255) r = 255
        else if (r < 0) r = 0
        if (g > 255) g = 255
        else if (g < 0) g = 0
        if (b > 255) b = 255
        else if (b < 0) b = 0

        src[i] = (src[i] & 0xFF000000) | (b << 16) | (g << 8) | r
    }
    return new Uint8ClampedArray(src.buffer)
}

function canvasBrightness(sourceData) {
    const src = new Uint32Array(sourceData.data.buffer)
    const delta = -255 / 2
    for (let i = 0; i < src.length; i++) {
        let r = src[i] & 0xFF
        let g = (src[i] >> 8) & 0xFF
        let b = (src[i] >> 16) & 0xFF

        r += delta
        g += delta
        b += delta

        if (r > 255) r = 255
        else if (r < 0) r = 0
        if (g > 255) g = 255
        else if (g < 0) g = 0
        if (b > 255) b = 255
        else if (b < 0) b = 0

        src[i] = (src[i] & 0xFF000000) | (b << 16) | (g << 8) | r
    }
    return new Uint8ClampedArray(src.buffer)
}

function QRScaner(canvas, context, filteredSourceData) {
    const filteredImageData = new ImageData(filteredSourceData, canvas.width, canvas.height)
    canvas.width += 2 * padding
    canvas.height += 2 * padding
    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.putImageData(filteredImageData, padding, padding)
    const img = new Image()
    img.src = canvas.toDataURL()
    document.body.appendChild(img)
    //Read data directly from the canvas
    try {
        return new BrowserQRCodeReader(null).decodeFromCanvas(canvas)
    } catch (e) {
        return e
    }
}
