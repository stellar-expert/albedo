const {AssetDescriptor} = require('@stellar-expert/asset-descriptor')

/**
 * @param {OperationDescriptor} od
 * @param {Boolean} skipUnrelated?
 * @returns {TypeMatcherCallback}
 * @internal
 */
function getOperationTypeMatcher(od, skipUnrelated = false) {
    const {operation: op} = od
    switch (op.type) {
        case 'createAccount':
        case 'accountMerge':
        case 'inflation':
            return () => matchOpProps(od, [op.destination], ['XLM'])
        case 'payment':
            return () => matchOpProps(od, [op.destination], [op.asset])
        case 'pathPaymentStrictSend':
        case 'pathPaymentStrictReceive':
            return () => matchOpProps(od, [op.destination], [op.sendAsset, op.destAsset, ...op.path])
        case 'manageBuyOffer':
        case 'manageSellOffer':
        case 'createPassiveSellOffer':
            return () => matchOpProps(od, [], [op.selling, op.buying])
        case 'setOptions':
            return () => matchOpProps(od, skipUnrelated || od.contextType !== 'account' ? [] : [op.inflationDest, op.signer?.key], [])
        case 'changeTrust':
            return () => matchOpProps(od, [], [op.asset])
        case 'allowTrust':
            return () => matchOpProps(od, [op.trustor], [AssetDescriptor.parse({code: op.assetCode, issuer: op.source}).toFQAN()])
        case 'createClaimableBalance':
            return () => matchOpProps(od, skipUnrelated || od.contextType !== 'account' ? [] : op.claimants.filter(c => c.destination === od.context), [op.asset])
        case 'claimClaimableBalance':
            return () => matchOpProps(od, [], od.successful ? [op.effects.find(e => e.type === 'accountCredited').asset] : [])
        case 'beginSponsoringFutureReserves':
            return () => matchOpProps(od, [op.sponsoredId], [])
        case 'revokeAccountSponsorship':
        case 'revokeTrustlineSponsorship':
        case 'revokeOfferSponsorship':
        case 'revokeDataSponsorship':
        case 'revokeClaimableBalanceSponsorship':
        case 'revokeLiquidityPoolSponsorship':
        case 'revokeSignerSponsorship':
        case 'revokeSponsorship':
            return () => matchOpProps(od, [op.account, op.signer?.key, op.seller], [op.asset])
        case 'clawback':
            return () => matchOpProps(od, [op.from], [op.asset])
        case 'setTrustLineFlags':
            return () => matchOpProps(od, [op.trustor], [op.asset])
        case 'liquidityPoolDeposit':
        case 'liquidityPoolWithdraw':
            const depositedAssets = []
            if (od.successful) {
                const poolUpdatedEffect = op.effects.find(e => e.type === 'liquidityPoolUpdated')
                for (let r of poolUpdatedEffect.reserves) {
                    depositedAssets.push(r.asset)
                }
            }
            return () => matchOpProps(od, [], depositedAssets)
        case 'manageData':
        case 'bumpSequence':
        case 'endSponsoringFutureReserves':
        case 'clawbackClaimableBalance':
            return () => matchOpProps(od, [], [])
        default:
            throw new Error('Unsupported op type: ' + op.type)

    }
}

/**
 * @param {OperationDescriptor} od
 * @param {String[]} accounts
 * @param {String[]} assets
 * @return {Boolean}
 * @internal
 */
function matchOpProps(od, accounts, assets) {
    const {contextType, context} = od
    if (!context)
        return true
    if (contextType === 'account') {
        if (od.operation.source === context)
            return true
        for (let value of accounts) {
            if (context === value)
                return true
        }
    }
    if (contextType === 'asset') {
        for (let value of assets) {
            if (typeof value !== 'string' || (value !== 'XLM' && !/\w{1,12}-G\w{55}-[12]/.test(value))) {
                value = AssetDescriptor.parse(value).toFQAN()
            }
            if (od.context === value)
                return true
        }
    }
    return false
}

/**
 * @param {OperationDescriptor} od
 * @param {'payments'|'trading'|'settings'} filter?
 * @return {Boolean}
 * @internal
 */
function matchOperationFilter(od, filter) {
    if (!filter)
        return true
    switch (od.operation.type) {
        case 'payment':
        case 'createClaimableBalance':
        case 'claimClaimableBalance':
        case 'inflation':
            return filter === 'payments'
        case 'createAccount':
        case 'accountMerge':
        case 'clawback':
        case 'clawbackClaimableBalance':
            return filter === 'payments' || filter === 'settings'
        case 'pathPaymentStrictSend':
        case 'pathPaymentStrictReceive':
            return filter === 'payments' || filter === 'trading'
        case 'manageBuyOffer':
        case 'manageSellOffer':
        case 'createPassiveSellOffer':
            return filter === 'trading'
        case 'setOptions':
        case 'changeTrust':
        case 'allowTrust':
        case 'beginSponsoringFutureReserves':
        case 'revokeSponsorship':
        case 'setTrustLineFlags':
        case 'liquidityPoolDeposit':
        case 'liquidityPoolWithdraw':
        case 'manageData':
        case 'bumpSequence':
        case 'endSponsoringFutureReserves':
            return filter === 'settings'
        default:
            throw new Error('Unsupported op type: ' + od.operation.type)
    }
}

/**
 * @param {OperationDescriptor} od
 * @param {'payments'|'trading'|'settings'} filter?
 * @return {Boolean}
 */
function matchOperationContext(od, filter) {
    if (!od)
        return true
    if (!matchOperationFilter(od, filter))
        return false
    if (!od.context)
        return true
    const cb = getOperationTypeMatcher(od)
    return cb(od)
}

module.exports = {matchOperationContext}

/**
 * Callback for matching operation by type
 * @callback TypeMatcherCallback
 * @param {OperationDescriptor} op - Operation descriptor to match
 * @return {Boolean}
 * @internal
 */