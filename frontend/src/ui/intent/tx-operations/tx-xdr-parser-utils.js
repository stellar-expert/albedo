import {StrKey} from 'stellar-sdk'
import Bignumber from 'bignumber.js'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'

/**
 * Parse account address from XDR representation
 * @param accountId
 * @param muxedAccountsSupported
 * @return {String|{muxedId: String, primary: String}}
 */
export function xdrParseAccountAddress(accountId, muxedAccountsSupported = false) {
    if (!accountId) return undefined
    if (accountId.arm) {
        switch (accountId.arm()) {
            case 'ed25519':
                return StrKey.encodeEd25519PublicKey(accountId.ed25519())
            case 'med25519':
                if (!muxedAccountsSupported)
                    throw new Error(`Muxed accounts not supported here`)
                return {
                    primary: StrKey.encodeEd25519PublicKey(accountId.value().ed25519()),
                    muxedId: xdrParseLong(accountId.value().id())
                }
            default:
                throw new Error(`Unsupported muxed account type: ${accountId.arm()}`)
        }
    }
    if (accountId instanceof Buffer) {
        return StrKey.encodeEd25519PublicKey(accountId)
    }
    throw new TypeError(`Failed to identify and parse account address: ${accountId}`)
}


/**
 * Parse XDR-encoded int64 to BSON Long.
 * @param {{low:Number, high:Number}} value - XDR-encoded int64.
 * @return {String}
 */
export function xdrParseLong(value) {
    if (!value) return '0'
    return new Bignumber(value.high).mul(new Bignumber(4294967295)).add(value.low).toString()
}

/**
 * Parse XDR price representation
 * @param {{n: Function, d: Function}} price
 * @return {Number}
 */
export function xdrParsePrice(price) {
    return price.n() / price.d()
}

/**
 * Parse account signer key XDR
 * @param {xdr.SignerKey} signer
 * @return {String}
 */
export function xdrParseSignerKey(signer) {
    const type = signer.switch()
    switch (type) {
        case 'ed25519':
            return StrKey.encodeEd25519PublicKey(signer.ed25519())
        case 'preAuthTx':
            return StrKey.encodePreAuthTx(signer.preAuthTx())
        case 'hashX':
            return StrKey.encodeSha256Hash(signer.hashX())
        case 'ed25519SignedPayload':
            return StrKey.encodeSignedPayload(signer.ed25519SignedPayload()) //TODO: check
    }
    throw new Error(`Unsupported signer type: "${type}"`)
}


/**
 * @typedef {Object} ParsedOffer
 * @property {String} offerId
 * @property {String} account
 * @property {Buffer} poolId
 * @property {Array<String>} asset
 * @property {Array<Long>} amount
 */

/**
 * Parse maker offer descriptor from raw XDR.
 * @param {Object} offerXdr
 * @return {ParsedOffer}
 */
export function xdrParseTradeAtom(offerXdr) {
    return {
        offerId: xdrParseLong(offerXdr.offerId()),
        account: xdrParseAccountAddress(offerXdr.sellerId()),
        asset: [AssetDescriptor.parse(offerXdr.selling()).toString(), AssetDescriptor.parse(offerXdr.buying()).toString()],
        //offer amount is always stored in terms of a selling asset, even for buy offers
        amount: xdrParseLong(offerXdr.amount() || offerXdr.buyAmount()),
        //flags: offerXdr.flags()
        price: xdrParsePrice(offerXdr.price())
    }
}

/**
 * Parse claimed offer atom from raw XDR.
 * @param {xdr.ClaimAtom} claimedAtom
 * @return {ParsedOffer}
 */
export function xdrParseClaimedOffer(claimedAtom) {
    const atomType = claimedAtom.arm()
    switch (atomType) {
        case 'v0':
            claimedAtom = claimedAtom.v0()
            return {
                asset: [AssetDescriptor.parse(claimedAtom.assetSold()).toString(),
                    AssetDescriptor.parse(claimedAtom.assetBought()).toString()],
                amount: [xdrParseLong(claimedAtom.amountSold()),
                    xdrParseLong(claimedAtom.amountBought())],
                account: xdrParseAccountAddress(claimedAtom.sellerEd25519()),
                offerId: xdrParseLong(claimedAtom.offerId())
            }
        case 'orderBook':
            claimedAtom = claimedAtom.orderBook()
            return {
                asset: [AssetDescriptor.parse(claimedAtom.assetSold()).toString(),
                    AssetDescriptor.parse(claimedAtom.assetBought()).toString()],
                amount: [xdrParseLong(claimedAtom.amountSold()),
                    xdrParseLong(claimedAtom.amountBought())],
                account: xdrParseAccountAddress(claimedAtom.sellerId()),
                offerId: xdrParseLong(claimedAtom.offerId())
            }
        case 'liquidityPool':
            claimedAtom = claimedAtom.liquidityPool()
            return {
                asset: [AssetDescriptor.parse(claimedAtom.assetSold()).toString(),
                    AssetDescriptor.parse(claimedAtom.assetBought()).toString()],
                amount: [xdrParseLong(claimedAtom.amountSold()),
                    xdrParseLong(claimedAtom.amountBought())],
                poolId: claimedAtom.liquidityPoolId()
            }
        default:
            throw new Error(`Unsupported claimed atom type: ` + atomType)
    }
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
            return {absBefore: xdrParseLong(value)}
        case 'claimPredicateBeforeRelativeTime':
            return {relBefore: xdrParseLong(value)}
        default:
            throw new Error(`Unknown claim condition predicate: ${type}`)
    }
}

export function xdrParseClaimant(claimant) {
    const value = claimant.value()
    return {
        destination: xdrParseAccountAddress(value.destination()),
        predicate: xdrParseClaimantPredicate(value.predicate())
    }
}

export function xdrParseClaimableBalanceId(rawBalanceId) {
    return Buffer.from(rawBalanceId).toString('hex')
}
