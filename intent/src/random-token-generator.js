export function generateRandomToken() {
    const parts = []
    for (let i = 0; i < 4; i++) {
        parts.push(Math.random().toString(36).slice(2))
    }
    return parts.join('')
}