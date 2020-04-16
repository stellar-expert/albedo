const intentErrors = {
    unhandledError: {
        message: 'Unhandled error occurred. If this error persists, please contact our support team.',
        code: -1
    },
    externalError: {
        message: 'External error occurred.',
        code: -2
    },
    invalidIntentRequest: {
        message: 'Intent request is invalid.',
        code: -3
    },
    actionRejectedByUser: {
        message: 'Action request was rejected by the user.',
        code: -4
    }
}

export default intentErrors