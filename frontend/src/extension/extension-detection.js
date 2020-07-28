export function isExtensionInstalled() {
    return window.sessionStorage.getItem('albedoExtensionInstalled') === '1'
}