import standardErrors from '../util/errors'

export default function (responder) {
    responder.registerReaction('sign_message', async function ({actionContext, executionContext}) {
        try {
            const {message} = actionContext.intentParams,
                {signature, signedMessage} = await executionContext.signMessage(message)

            return {
                pubkey: executionContext.publicKey,
                signed_message: signedMessage.toString('hex'),
                message_signature: signature.toString('hex')
            }
        } catch (e) {
            console.error(e)
            if (e.code) throw e
            throw standardErrors.messageSigningFailed
        }
    })

    responder.registerReaction('public_key', async function ({actionContext, executionContext}) {
        try {
            const {publicKey} = executionContext,
                messageToSign = actionContext.intentParams.token,
                {signature, signedMessage} = await executionContext.signMessage(messageToSign)

            return {
                pubkey: publicKey,
                signed_message: signedMessage.toString('hex'),
                signature: signature.toString('hex')
            }
        } catch (e) {
            console.error(e)
            if (e.code) throw e
            throw standardErrors.messageSigningFailed
        }
    })
}
