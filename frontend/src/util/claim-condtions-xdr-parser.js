import {StrKey} from 'stellar-sdk'

function xdrParseAccountAddress(accountId) {
    if (!accountId) return undefined
    if (accountId.arm) {
        switch (accountId.arm()) {
            case 'ed25519':
                accountId = accountId.ed25519()
                break
            case 'med25519':
                //accountId.value().id()
                accountId = accountId.value().ed25519()
                break
            default:
                throw new Error(`Unsupported muxed account type: ${accountId.arm()}`)
        }
    }
    return StrKey.encodeEd25519PublicKey(accountId)
}

function xdrParseClaimantPredicate(predicate) {
    if (!predicate) return {}
    const type = predicate.switch().name,
        value = predicate.value()
    switch (type) {
        case 'claimPredicateUnconditional':
            return {}
        case 'claimPredicateAnd':
            return {and: value.map(p => xdrParseClaimantPredicate(p))}
        case 'claimPredicateOr':
            return {or: value.map(p => xdrParseClaimantPredicate(p))}
        case 'claimPredicateNot':
            return {not: xdrParseClaimantPredicate(value)}
        case 'claimPredicateBeforeAbsoluteTime':
            return {absBefore: value.toNumber()}
        case 'claimPredicateBeforeRelativeTime':
            return {relBefore: value.toNumber()}
        default:
            throw new Error(`Unknown claim condition predicate: ${type}`)
    }
}

export function xdrParseClaimant(claimant) {
    return {
        destination: xdrParseAccountAddress(claimant.destination),
        predicate: xdrParseClaimantPredicate(claimant.predicate)
    }
}