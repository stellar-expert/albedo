import standardErrors from '../util/errors'

export default function (registerReaction) {
    registerReaction('sign_message', async function ({intentRequest, executionContext}) {
        try {
            const {signature, signedMessage} = await executionContext.signMessage(intentRequest.intentParams.message)

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

    registerReaction('public_key', async function ({intentRequest, executionContext}) {
        try {
            const {publicKey} = executionContext,
                {signature, signedMessage} = await executionContext.signMessage(intentRequest.intentParams.token)

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
