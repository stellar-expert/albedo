import accountManager from '../state/account-manager'
import standardErrors from '../util/errors'

export default function (responder) {
    responder.registerReaction('sign_message', async function ({actionContext, executionContext}) {
        try {
            const {message} = actionContext.intentParams,
                {signature, signedMessage} = await executionContext.signMessage(message)

            return {
                pubkey: executionContext.publicKey,
                original_message: message,
                signed_message: signedMessage.toString('hex'),
                message_signature: signature.toString('hex')
            }
        } catch (e) {
            console.error(e)
            if (e.code) throw e
            throw standardErrors.messageSigningFailed
        }
    })

    responder.registerReaction('basic_info', async function ({executionContext}) {
        try {
            const {email, avatar = null} = accountManager.activeAccount,
                info = {avatar, email},
                messageToSign = JSON.stringify(info),
                {signature, signedMessage} = await executionContext.signMessage(messageToSign)

            return {
                info,
                pubkey: executionContext.publicKey,
                signed_message: signedMessage.toString('hex'),
                signature: signature.toString('hex')
            }
        } catch (e) {
            console.error(e)
            if (e.code) throw e
            throw standardErrors.messageSigningFailed
        }
    })

    responder.registerReaction('public_key', async function ({executionContext}) {
        try {
            const {publicKey} = executionContext,
                messageToSign = publicKey,
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
