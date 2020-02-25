import errors from './errors'

function normalizeEmail(email) {
    if (!email) return null
    email = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/) return null
    return email
}

function validateAccountPassword(password) {
    if (!password || typeof password !== 'string' || password.length < 8) return Promise.reject(errors.invalidPasswordFormat)
    return Promise.resolve(password)
}

function validateAccountEmail(email) {
    if (!email) return Promise.reject(errors.invalidEmail)
    return Promise.resolve(email)
}

export {
    normalizeEmail,
    validateAccountEmail,
    validateAccountPassword
}