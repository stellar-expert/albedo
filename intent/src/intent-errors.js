const intentErrors = {
    unhandledError: {
        message: 'Unhandled error occurred. If this error persists, please contact Albedo support.',
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
    },
    horizonError: {
        message: 'Transaction failed when submitted to Stellar network.',
        code: -5
    },
    callbackError: {
        message: 'Callback redirect failed.',
        code: -6
    }
}

export default intentErrors