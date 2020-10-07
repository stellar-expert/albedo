export function isSafari() {
    const ua = navigator.userAgent
    if (ua.includes('iPhone') && !ua.includes('CriOS') && !ua.includes('FxiOS')) return true
    if (ua.includes('Safari') && !ua.includes('Chrome')) return true
    return false
}