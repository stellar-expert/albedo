import {Keypair} from 'stellar-sdk'
import accountManager from '../state/account-manager'
import {saveImplicitSession} from '../storage/implicit-session-storage'

function findFriendlyName(account, desiredName) {
    if (!desiredName) desiredName = 'New key pair'
    const similarNames = account.keypairs
        .map(kp => kp.friendlyName)
        .filter(name => name.indexOf(desiredName) === 0)
    if (!similarNames.includes(desiredName)) return Promise.resolve(desiredName)
    //try to pick up similar name automatically
    for (let i = 2; i < 50; i++) {
        let name = desiredName + ' ' + i
        if (!similarNames.includes(name)) return Promise.resolve(name)
    }
    return Promise.reject(new Error('Failed to pick up friendly name for the key pair.'))
}

export default function (responder) {
    responder.registerReaction('create_keypair', function ({actionContext, sensitiveData}) {
        const {intentParams} = actionContext,
            {activeAccount} = accountManager,
            {name: desiredName} = intentParams
        return findFriendlyName(desiredName)
            .then(friendlyName => {
                const kp = Keypair.random()
                //add/modify a keypair
                sensitiveData.addOrUpdateKeypair({secret: kp.secret(), friendlyName})
                //update the data
                return activeAccount.updateAccountSecret(credentials, sensitiveData)
                //save account on the server and in browser
                    .then(() => activeAccount.save(credentials))
                    .then(() => ({
                        pubkey: kp.publicKey(),
                        friendlyName
                    }))
            })
    })

    responder.registerReaction('implicit_flow', function ({actionContext, executionContext}) {
        const {intentParams} = actionContext,
            {activeAccount} = accountManager,
            {intents, network} = intentParams
        return executionContext.retrieveSessionData()
            .then(data => {
                Object.assign(data, {intents, network})
                const {sessionKey, validUntil} = saveImplicitSession(activeAccount, 3600, data)
                return {
                    granted: true,
                    network: network,
                    session: sessionKey,
                    pubkey: data.publicKey,
                    grants: intents,
                    valid_until: validUntil
                }
            })
    })
}