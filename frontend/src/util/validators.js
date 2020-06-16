import errors from './errors'

function validateAccountPassword(password) {
    if (!password || typeof password !== 'string' || password.length < 8) return Promise.reject(errors.invalidPasswordFormat)
    return Promise.resolve(password)
}

export {
    validateAccountPassword
}