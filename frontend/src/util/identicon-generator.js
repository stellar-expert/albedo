import shajs from 'sha.js'
import Identicon from 'identicon.js'

function generateIdenticon(src, size = 36) {
    const code = shajs('sha256').update(src).digest(),
        hex = new Buffer(code).toString('hex')

    const icon = new Identicon(hex, {
        format: 'svg',
        margin: 0.22,
        size,
        background: [255, 255, 255, 255]
    })

    return icon.toString()
}

export {generateIdenticon}