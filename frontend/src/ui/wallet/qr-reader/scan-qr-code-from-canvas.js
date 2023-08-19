import {BrowserQRCodeReader} from '@zxing/browser'

const minDetectionAreaWidth = 600 //minimum resolution for QR code detection

/**
 *  Render video or image on canvas, apply contrast improvement filters, and try to detect QR code.
 * @param {Object} source - Image or Video component
 * @return {Object | null}
 */
export default function scanQrCodeFromCanvas(source) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', {willReadFrequently: true, powerPreference: 'low-power'})
    const width = source.videoWidth || source.width
    const height = source.videoHeight || source.height
    const scaleFactor = width >= minDetectionAreaWidth ?
        Math.floor(width / minDetectionAreaWidth) :
        Math.ceil(minDetectionAreaWidth / width)
    const imgWidth = width * scaleFactor || minDetectionAreaWidth
    const imgHeight = height * scaleFactor || minDetectionAreaWidth
    //Change size of image
    canvas.width = imgWidth
    canvas.height = imgHeight
    //apply brightness filter, helpful for more cases
    context.drawImage(source, 0, 0, imgWidth, imgHeight)
    const sourceDataBrightnessFilter = context.getImageData(0, 0, imgWidth, imgHeight)
    let result = tryScan(canvas, context, applyBrightnessFilter(sourceDataBrightnessFilter))
    if (result?.text)
        return result.text
    //try contrast filter if the brightness filter didn't help
    //context.filter = "contrast(200%)" //when all browsers will supports native filter - we could use it
    context.drawImage(source, 0, 0, imgWidth, imgHeight)
    const sourceDataContrastFilter = context.getImageData(0, 0, imgWidth, imgHeight)
    result = tryScan(canvas, context, applyContrastFilter(sourceDataContrastFilter))
    return result?.text
}

function applyBrightnessFilter(sourceData) {
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

function applyContrastFilter(sourceData) {
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

function tryScan(canvas, context, filteredSourceData) {
    const filteredImageData = new ImageData(filteredSourceData, canvas.width, canvas.height)
    context.putImageData(filteredImageData, 0, 0)
    //Read data directly from the canvas
    try {
        return new BrowserQRCodeReader(null).decodeFromCanvas(canvas)
    } catch (e) {
        return null
    }
}
