/**
 * Show a confirmation dialog and check whether a user confirmed the action.
 * The framework dialog rejects the promise with no reason when a user cancels it, so every caller
 * has to handle the rejection explicitly to avoid an unhandled promise rejection.
 * @param {JSX.Element|String} content - Dialog contents.
 * @param {Object} [options] - Dialog options (title, icon, confirmTitle, cancelTitle).
 * @return {Promise<Boolean>} True if a user confirmed the action, false if it has been cancelled.
 */
export function requestConfirmation(content, options) {
    return confirm(content, options).then(() => true, () => false)
}
