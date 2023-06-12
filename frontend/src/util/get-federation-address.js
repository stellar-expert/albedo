import {FederationServer} from 'stellar-sdk'

export async function getFederationAddress(destinationInfo) {
    if (destinationInfo?.home_domain) {
        return await FederationServer.createForDomain(destinationInfo?.home_domain, {timeout: 3000})
            .then(async server => {
                const result = await server.resolveAccountId(destinationInfo.account_id)
                return result.stellar_address || ''
            }).catch(() => '')
    }
}