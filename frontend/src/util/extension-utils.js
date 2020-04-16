function isInsideExtension() {
    return typeof chrome === 'object' && chrome.runtime && chrome.runtime.id
}

function isInsideExtensionBackgroundScript(){
    return isInsideExtension() && !window.opener
}

export {isInsideExtension, isInsideExtensionBackgroundScript}