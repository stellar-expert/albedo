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

export default function (registerReaction) {
    registerReaction('implicit_flow', function ({intentRequest, executionContext}) {
        const {account} = executionContext,
            {intents, network} = intentRequest.intentParams
        return executionContext.retrieveSessionData()
            .then(data => {
                Object.assign(data, {intents, network})
                return saveImplicitSession(account, 3600, data)
            })
            .then(({sessionKey, validUntil, pubkey}) => ({
                granted: true,
                network: network,
                session: sessionKey,
                pubkey,
                intents,
                grants: intents,
                valid_until: validUntil
            }))
    })

    registerReaction('manage_account', function ({intentRequest}) {
        return Promise.resolve({pubkey: intentRequest.intentParams.pubkey})
    })
}