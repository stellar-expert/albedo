function openDialogWindow(url) {
    const w = 460,
        h = 600,
        // Fixes dual-screen position                         Most browsers      Firefox
        dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX,
        dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY,
        currentWindowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
        currentWindowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
        left = ((currentWindowWidth / 2) - (w / 2)) + dualScreenLeft,
        top = ((currentWindowHeight / 2) - (h / 2)) + dualScreenTop

    return window.open(url, 'auth.albedo.link', `height=${h},width=${w},top=${top},left=${left},menubar=0,toolbar=0,location=0,status=0,personalbar=0,scrollbars=0,dependent=1`)
}

export {openDialogWindow}