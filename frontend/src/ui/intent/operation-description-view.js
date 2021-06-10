import React from 'react'
import PropTypes from 'prop-types'
import Address from '../components/account-address'
import Amount from '../components/amount'
import AssetName from '../components/asset-name'
import {xdrParseClaimant} from '../../util/claim-condtions-xdr-parser'

function formatBalanceId(balance) {
    return `${balance.substr(8, 4)}…${balance.substr(-4)}`
}

export default function OperationDescriptionView({op, source}) {
    function SourceAccount() {
        if (!op.source) return null
        return <> on behalf of account <Address account={op.source || source}/></>
    }

    let asset
    switch (op.type) {
        case 'createAccount':
            return <>
                <b>Create account</b> <Address account={op.destination}/> with starting
                balance <Amount amount={op.startingBalance} asset="XLM"/><SourceAccount/>
            </>
        case 'payment':
            return <>
                <b>Pay</b> <Amount amount={op.amount} asset={op.asset}/> to <Address account={op.destination}/>
                <SourceAccount/>
            </>
        case 'pathPaymentStrictReceive':
            return <>
                <b>Path payment</b> max <Amount amount={op.sendMax} asset={op.sendAsset}/>
                <span className="fa fa-space fa-random"/>
                {op.path.map((asset, i) => <span key={i}>
                    <AssetName asset={asset}/>
                    <span className="fa fa-space fa-random"/>
                </span>)}
                <Amount amount={op.destAmount} asset={op.destAsset}/> to <Address account={op.destination}/>
                <SourceAccount/>
            </>
        case 'pathPaymentStrictSend':
            return <>
                <b>Path payment</b> <Amount amount={op.amount} asset={op.sendAsset}/>
                <span className="fa fa-space fa-random"/>
                {op.path.map((asset, i) => <span key={i}>
                    <AssetName asset={asset}/>
                    <span className="fa fa-space fa-random"/>
                </span>)}
                min <Amount amount={op.destAmount} asset={op.destAsset}/> to <Address account={op.destination}/>
                <SourceAccount/>
            </>
        case 'manageSellOffer':
        case 'manageBuyOffer': {
            const direction = op.type === 'manageSellOffer' ? 'sell' : 'buy'
            let action,
                isCancelled = parseFloat(op.amount) === 0
            if (op.offerId && op.offerId !== '0') { //manage existing offer
                action = (isCancelled ? `Cancel offer ` : `Update ${direction} offer `)
            } else {
                action = `Create offer`
            }
            if (isCancelled) {
                return <>
                    <b>{action}</b> #{op.offerId}<SourceAccount/>
                </>
            } else {
                return <>
                    <b>{action} {op.offerId > 0 && ('#' + op.offerId)} {direction}</b>{' '}
                    <Amount amount={op.amount} asset={op.selling}/> for <AssetName asset={op.buying}/>{' '}
                    at <b>{op.price}</b> {op.buying.code}/{op.selling.code}<SourceAccount/>
                </>
            }
        }
        case 'createPassiveSellOffer':
        case 'createPassiveBuyOffer': {
            const direction = op.type === 'manageSellOffer' ? 'sell' : 'buy'
            return <>
                <b>Create passive {direction} offer</b> <Amount amount={op.amount} asset={op.selling}/> for{' '}
                <AssetName asset={op.buying}/> at <b>{op.price}</b> {op.buying.code}/{op.selling.code}
                <SourceAccount/>
            </>
        }
        case 'setOption':
        case 'setOptions':
            return <>
                <b>Set options</b><SourceAccount/>
                {!!(op.setFlags && (op.setFlags & 1)) && <>
                    <br/>Set trustline authorization required flag
                </>}
                {!!(op.setFlags && (op.setFlags & 2)) && <>
                    <br/>Set trustline authorization revocable flag
                </>}
                {!!(op.clearFlags && (op.clearFlags & 1)) && <>
                    <br/>Clear trustline authorization required flag
                </>}
                {!!(op.clearFlags && (op.clearFlags & 2)) && <>
                    <br/>Clear trustline authorization revocable flag
                </>}
                {op.homeDomain !== undefined && <>
                    <br/>Set home domain {op.homeDomain ?
                    <a href={'http://' + op.homeDomain} target="_blank">{op.homeDomain}</a> :
                    'not set'}
                </>}
                {op.inflationDest !== undefined && <>
                    <br/>Set inflation destination to <Address account={op.inflationDest}/>
                </>}
                {op.lowThreshold !== undefined && <>
                    <br/>Set low threshold to {op.lowThreshold}
                </>}
                {op.medThreshold !== undefined && <>
                    <br/>Set medium threshold to {op.medThreshold}
                </>}
                {op.highThreshold !== undefined && <>
                    <br/>Set high threshold to {op.highThreshold}</>}
                {!!op.signer && <>
                    <br/>Add new signer <Address account={op.signer.ed25519PublicKey}/> with
                    weight {op.signer.weight}
                </>}
                {op.masterWeight !== undefined && <>
                    <br/>Set master key weight to {op.masterWeight}
                </>}
            </>
        case 'changeTrust':
            if (parseFloat(op.limit) > 0)
                return <>
                    <b>Create trustline</b> to <AssetName asset={op.line}/> with
                    limit <Amount amount={op.limit} asset={op.line}/>
                    <SourceAccount/>
                </>
            return <>
                <b>Remove trustline</b> to <AssetName asset={op.line}/><SourceAccount/>
            </>
        case 'allowTrust':
            asset = {code: op.assetCode, issuer: op.source || source}
            if (op.authorize) return <>
                <b>Allow trustline</b> <AssetName asset={asset}/> for
                account <Address account={op.trustor}/><SourceAccount/>
            </>
            return <>
                <b>Disallow trustline</b> <AssetName asset={asset}/> for
                account <Address account={op.trustor}/><SourceAccount/>
            </>
        case 'accountMerge':
            return <>
                <b>Merge account</b> <Address account={op.source || source}/> into
                account <Address account={op.destination}/><SourceAccount/>
            </>
        case 'inflation':
            return <>
                <b>Run inflation</b><SourceAccount/>
            </>
        case 'manageDatum':
        case 'manageData':
            if (!op.value) return <>
                <b>Delete data entry</b> "{op.name}"<SourceAccount/>
            </>
            return <>
                <b>Add data entry</b> "{op.name}"="{op.value}"<SourceAccount/>
            </>
        case 'bumpSequence':
            return <>
                <b>Bump account sequence</b> to {op.sequence}<SourceAccount/>
            </>
        case 'createClaimableBalance':
            return <>
                <b>Created claimable balance</b> <Amount amount={op.amount} asset={op.asset}/>{' '}
                for claimants {op.claimants.map(xdrParseClaimant).map((c, i) => <span key={i}>{i > 0 && ', '}
                <Address account={c.destination}/> with conditions <code>{JSON.stringify(c.predicate)}</code>
                </span>)}
                <SourceAccount/>
            </>
        case 'claimClaimableBalance':
            return <>
                <b>Claim balance</b> <code>{formatBalanceId(op.balanceId)}</code>
                <SourceAccount/>
            </>
        case 'beginSponsoringFutureReserves':
            return <>
                <b>Begin sponsoring future reserves</b> for <Address account={op.sponsoredId}/>
                <SourceAccount/>
            </>
        case 'endSponsoringFutureReserves':
            return <>
                <b>End sponsoring future reserves</b><SourceAccount/>
            </>
        case 'revokeAccountSponsorship':
            return <>
                <b>Revoke sponsorship</b> on account <Address account={op.account}/><SourceAccount/>
            </>
        case 'revokeTrustlineSponsorship':
            return <>
                <b>Revoke sponsorship</b> on trustline <AssetName asset={op.asset}/> for
                account <Address account={op.account}/><SourceAccount/>
            </>
        case 'revokeOfferSponsorship':
            return <>
                <b>Revoke sponsorship</b> on offer {op.offerId} for account <Address account={op.account}/>
                <SourceAccount/>
            </>
        case 'revokeDataSponsorship':
            return <>
                <b>Revoke sponsorship</b> on data entry {op.name} for account <Address account={op.account}/>
                <SourceAccount/>
            </>
        case 'revokeClaimableBalanceSponsorship':
            return <>
                <b>Revoke sponsorship</b> on claimable balance {formatBalanceId(op.balanceId)}
                <SourceAccount/>
            </>
        case 'revokeSponsorshipSigner':
            return <>
                <b>Revoke sponsorship</b> on signer <Address account={op.signer}/> for
                account <Address account={op.accountId}/><SourceAccount/>
            </>
        case 'clawback':
            return <>
                <b>Clawback</b> <Amount amount={op.amount} asset={op.asset}/> from <Address account={op.from}/>
                <SourceAccount/>
            </>
        case 'clawbackClaimableBalance':
            return <>
                <b>Clawback claimable balance</b> {formatBalanceId(op.balanceId)}<SourceAccount/>
            </>
        case 'setTrustLineFlags':
            return <>
                <b>Set trustline flags</b> {op.setFlags}, clear flags {op.clearFlags} for asset{' '}
                <AssetName asset={op.asset}/> of account <Address account={op.trustor}/><SourceAccount/>
            </>
    }
    throw new Error(`Not supported operation type: ${op.type}.`)
}

OperationDescriptionView.propTypes = {
    op: PropTypes.object.isRequired,
    source: PropTypes.string.isRequired
}