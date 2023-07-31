import {FederationServer} from 'stellar-sdk'

export function resolveFederationAccount(federationAddress, callback) {
    return FederationServer.resolve(federationAddress, {timeout: 3000})
        .then(res => callback(res || null))
        .catch(e => callback(null))//ignore resolution errors
}

export function resolveFederationAddress(homeDomain, account) {
    if (!homeDomain)
        return Promise.resolve(null)
    return FederationServer.createForDomain(homeDomain, {timeout: 3000})
        .then(async server => {
            const result = await server.resolveAccountId(account)
            return result.stellar_address || null
        })
        .catch(() => null)
}

