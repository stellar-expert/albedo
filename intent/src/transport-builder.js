import TransportHandler from './transport-handler'

/**
 * Create explicit dialog window transport.
 * @param {String} frontendUrl - URL of the Albedo frontend.
 * @return {TransportHandler}
 */
function createDialogWindow(frontendUrl) {
    const url = `${frontendUrl}/confirm`,
        w = 440,
        h = 600,
        // Fixes dual-screen position                         Most browsers      Firefox
        dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX,
        dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY,
        currentWindowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
        currentWindowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
        left = ((currentWindowWidth / 2) - (w / 2)) + dualScreenLeft,
        top = ((currentWindowHeight / 2) - (h / 2)) + dualScreenTop

    const dialogWindow = window.open(url, 'auth.albedo.link', `height=${h},width=${w},top=${top},left=${left},menubar=0,toolbar=0,location=0,status=0,personalbar=0,scrollbars=0,dependent=1`)
    return new TransportHandler(dialogWindow)
}

let implicitTransportInstance = null

/**
 * Create implicit transport.
 * @param {String} frontendUrl - URL of the Albedo frontend.
 * @return {TransportHandler}
 */
function createHiddenFrame(frontendUrl) {
    //check if already initialized
    if (implicitTransportInstance) return implicitTransportInstance

    const iframe = document.createElement('iframe')
    Object.assign(iframe, {
        width: 0,
        height: 0,
        border: 0,
        referrerpolicy: 'origin',
        position: 'absolute',//???
        style: '',
        src: `${frontendUrl}/implicit`
    })
    document.body.appendChild(iframe)
    implicitTransportInstance = new TransportHandler(iframe.contentWindow, true)
    return implicitTransportInstance
}

export {createDialogWindow, createHiddenFrame}