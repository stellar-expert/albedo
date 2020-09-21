export function generateRandomToken() {
    const rn = new Uint32Array(4)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(rn)
    } else {
        for (let i = 0; i < rn.length; i++) {
            rn[i] = Math.floor(Math.random() * 4294967295)
        }
    }
    return Array.from(rn).map(n => n.toString(36)).join('')
}