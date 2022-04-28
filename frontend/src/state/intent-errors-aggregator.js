/**
 * Extract and aggregate intent errors for all intent requests.
 * @param {(String|undefined)[]} errors
 * @param {Boolean} isBatch
 * @return {String|undefined}
 */
export function aggregateIntentErrors(errors, isBatch) {
    if (!isBatch) return errors[0]
    for (let i = 0; i < errors.length; i++) {
        const intentErrors = errors[i]
        if (intentErrors)
            return `[${i}] ${intentErrors}`
    }
}