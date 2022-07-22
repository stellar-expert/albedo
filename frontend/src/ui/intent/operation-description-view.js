import React from 'react'
import PropTypes from 'prop-types'
import {AccountAddress, Amount, AssetLink, ClaimableBalanceClaimants} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {formatPrice, formatWithAutoPrecision} from '@stellar-expert/formatter'

function formatBalanceId(balance) {
    return `${balance.substr(8, 4)}…${balance.substr(-4)}`
}

export default function OperationDescriptionView({op, source}) {
    function SourceAccount() {
        if (!op.source || op.source === source) return null
        return <> on behalf of account <AccountAddress account={op.source || source}/></>
    }

    let asset
    switch (op.type) {
        case 'createAccount':
            return <>
                <b>Create account</b> <AccountAddress account={op.destination}/> with starting
                balance <Amount amount={op.startingBalance} asset="XLM"/><SourceAccount/>
            </>
        case 'payment':
            return <>
                <b>Pay</b> <Amount amount={op.amount} asset={op.asset}/> to <AccountAddress account={op.destination}/>
                <SourceAccount/>
            </>
        case 'pathPaymentStrictReceive':
            return <>
                <b>{source === op.destination ? 'Swap' : 'Pay'}</b> <Amount amount={op.sendMax} asset={op.sendAsset}/>{' '}
                <span className="icon-shuffle"/>{' '}
                {op.path.map((asset, i) => <span key={i + '-' + asset.toString()}>
                    <AssetLink asset={asset}/>{' '}
                    <span className="icon-shuffle"/>{' '}
                </span>)}
                <Amount amount={op.destAmount} asset={op.destAsset}/>
                {source !== op.destination && <> to <AccountAddress account={op.destination}/></>}
                <SourceAccount/>
            </>
        case 'pathPaymentStrictSend':
            return <>
                <b>{source === op.destination ? 'Swap' : 'Pay'}</b> <Amount amount={op.sendAmount} asset={op.sendAsset}/>{' '}
                <span className="icon-shuffle"/>{' '}
                {op.path.map((asset, i) => <span key={i + '-' + asset.toString()}>
                    <AssetLink asset={asset}/>{' '}
                    <span className="icon-shuffle"/>{' '}
                </span>)}
                <Amount amount={op.destMin} asset={op.destAsset}/>
                {source !== op.destination && <> to <AccountAddress account={op.destination}/></>}
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
                    <Amount amount={op.amount} asset={op.selling}/> for <AssetLink asset={op.buying}/>{' '}
                    at <b>{op.price}</b> {op.buying.code}/{op.selling.code}<SourceAccount/>
                </>
            }
        }
        case 'createPassiveSellOffer':
        case 'createPassiveBuyOffer': {
            const direction = op.type === 'manageSellOffer' ? 'sell' : 'buy'
            return <>
                <b>Create passive {direction} offer</b> <Amount amount={op.amount} asset={op.selling}/> for{' '}
                <AssetLink asset={op.buying}/> at <b>{op.price}</b> {op.buying.code}/{op.selling.code}
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
                    <br/>Set inflation destination to <AccountAddress account={op.inflationDest}/>
                </>}
                {op.lowThreshold !== undefined && <>
                    <br/>Set low threshold to {op.lowThreshold}
                </>}
                {op.medThreshold !== undefined && <>
                    <br/>Set medium threshold to {op.medThreshold}
                </>}
                {op.highThreshold !== undefined && <>
                    <br/>Set high threshold to {op.highThreshold}</>}
                {!!op.signer && (op.signer.weight > 0 ? <>
                    <br/>Add new signer <AccountAddress account={op.signer.ed25519PublicKey}/> with
                    weight {op.signer.weight}
                </> : <>
                    <br/>Remove signer <AccountAddress account={op.signer.ed25519PublicKey}/>
                </>)}}
                {op.masterWeight !== undefined && <>
                    <br/>Set master key weight to {op.masterWeight}
                </>}
            </>
        case 'changeTrust':
            const trustAsset = AssetDescriptor.parse(op.line)
            if (parseFloat(op.limit) > 0)
                return <>
                    <b>Create trustline</b> for <AssetLink asset={trustAsset}/>
                    {op.limit !== '922337203685.4775807' &&
                        <> with limit <Amount amount={op.limit} asset={trustAsset}/></>}
                    <SourceAccount/>
                </>
            return <>
                <b>Remove trustline</b> to <AssetLink asset={trustAsset}/><SourceAccount/>
            </>
        case 'allowTrust':
            asset = {code: op.assetCode, issuer: op.source || source}
            if (op.authorize) return <>
                <b>Allow trustline</b> <AssetLink asset={asset}/> for
                account <AccountAddress account={op.trustor}/><SourceAccount/>
            </>
            return <>
                <b>Disallow trustline</b> <AssetLink asset={asset}/> for
                account <AccountAddress account={op.trustor}/><SourceAccount/>
            </>
        case 'accountMerge':
            return <>
                <b>Merge account</b> <AccountAddress account={op.source || source}/> into
                account <AccountAddress account={op.destination}/><SourceAccount/>
            </>
        case 'inflation':
            return <>
                <b>Initiate inflation</b><SourceAccount/>
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
                <b>Create claimable balance</b> <Amount amount={op.amount} asset={op.asset}/>{' '}
                for claimants <ClaimableBalanceClaimants claimants={op.claimants}/>
                <SourceAccount/>
            </>
        case 'claimClaimableBalance':
            return <>
                <b>Claim balance</b> <code>{formatBalanceId(op.balanceId)}</code>
                <SourceAccount/>
            </>
        case 'beginSponsoringFutureReserves':
            return <>
                <b>Begin sponsoring future reserves</b> for <AccountAddress account={op.sponsoredId}/>
                <SourceAccount/>
            </>
        case 'endSponsoringFutureReserves':
            return <>
                <b>End sponsoring future reserves</b><SourceAccount/>
            </>
        case 'revokeAccountSponsorship':
            return <>
                <b>Revoke sponsorship</b> on account <AccountAddress account={op.account}/><SourceAccount/>
            </>
        case 'revokeTrustlineSponsorship':
            return <>
                <b>Revoke sponsorship</b> on trustline <AssetLink asset={op.asset}/> for
                account <AccountAddress account={op.account}/><SourceAccount/>
            </>
        case 'revokeOfferSponsorship':
            return <>
                <b>Revoke sponsorship</b> on offer {op.offerId} for account <AccountAddress account={op.account}/>
                <SourceAccount/>
            </>
        case 'revokeDataSponsorship':
            return <>
                <b>Revoke sponsorship</b> on data entry {op.name} for account <AccountAddress account={op.account}/>
                <SourceAccount/>
            </>
        case 'revokeClaimableBalanceSponsorship':
            return <>
                <b>Revoke sponsorship</b> on claimable balance {formatBalanceId(op.balanceId)}
                <SourceAccount/>
            </>
        case 'revokeSignerSponsorship':
            return <>
                <b>Revoke sponsorship</b> on signer <AccountAddress account={op.signer}/> for
                account <AccountAddress account={op.accountId}/><SourceAccount/>
            </>
        case 'clawback':
            return <>
                <b>Clawback</b> <Amount amount={op.amount} asset={op.asset}/> from <AccountAddress account={op.from}/>
                <SourceAccount/>
            </>
        case 'clawbackClaimableBalance':
            return <>
                <b>Clawback claimable balance</b> {formatBalanceId(op.balanceId)}<SourceAccount/>
            </>
        case 'setTrustLineFlags':
            return <>
                <b>Set trustline flags</b> {op.setFlags}, clear flags {op.clearFlags} for asset{' '}
                <AssetLink asset={op.asset}/> of account <AccountAddress account={op.trustor}/><SourceAccount/>
            </>
        case 'liquidityPoolDeposit':
            return <>
                <b>Deposit liquidity</b> <Amount asset={'tokens A'} amount={op.maxAmountA}/>{' '}
                and <Amount asset={'tokens B'} amount={op.maxAmountB}/> to the pool <AssetLink
                asset={op.liquidityPoolId}/>{' '}
                <span className="dimmed">(price range {formatPrice(op.minPrice)} - {formatPrice(op.maxPrice)})</span>
                <SourceAccount/>
            </>
        case 'liquidityPoolWithdraw':
            return <>
                <b>Withdraw liquidity</b> from the pool <AssetLink asset={op.liquidityPoolId}/> –{' '}
                {formatWithAutoPrecision(op.amount)} shares
                <span className="dimmed"> (minimum <Amount asset={'tokens A'} amount={op.minAmountA}/>{' '}
                    and <Amount asset={'tokens B'} amount={op.minAmountB}/>)</span>
                <SourceAccount/>
            </>
    }
    throw new Error(`Not supported operation type: ${op.type}.`)
}

OperationDescriptionView.propTypes = {
    op: PropTypes.object.isRequired,
    source: PropTypes.string.isRequired
}
