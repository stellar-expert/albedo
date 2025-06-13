import standardErrors from '../util/errors'

export default function (registerReaction) {
    registerReaction('sign_message', async function ({intentRequest, executionContext}) {
        try {
            const {signature, albedoSignatureBase, signedMessage} = await executionContext.signMessage(intentRequest.intentParams.message, intentRequest.intentParams.binary)

            return {
                pubkey: executionContext.publicKey,
                signed_message: albedoSignatureBase,
                message_signature: signature.toString('hex'),
                signedMessage: signedMessage.toString('hex'),
                signerAddress: executionContext.publicKey
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
                {signature, albedoSignatureBase} = await executionContext.signMessage(intentRequest.intentParams.token)

            return {
                pubkey: publicKey,
                signed_message: albedoSignatureBase,
                signature: signature.toString('hex')
            }
        } catch (e) {
            console.error(e)
            if (e.code) throw e
            throw standardErrors.messageSigningFailed
        }
    })
}
