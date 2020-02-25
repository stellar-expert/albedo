import React from 'react'
import PropTypes from 'prop-types'
import Address from '../components/account-address'
import Amount from '../components/amount'
import AssetLink from '../components/asset-link'

function SourceAccount({op, source}) {
    if (!op.source) return null
    return <span>, source account: <Address account={op.source || source} compact/></span>
}

function OperationDescriptionView({op, source}) {
    let asset
    switch (op.type) {
        case 'createAccount':
            return <span><b>Create account</b> <Address account={op.destination} compact/> with starting
                balance <Amount amount={op.startingBalance} asset="XLM"/><SourceAccount op={op} source={source}/>.
                </span>
        case 'payment':
            return <span>
                <b>Payment</b> <Amount amount={op.amount} asset={op.asset}/> to <Address account={op.destination}
                                                                                         compact/>
                <SourceAccount op={op} source={source}/>.
            </span>
        case 'pathPaymentStrictReceive':
            return <span>
                <b>Path Payment</b> max <Amount amount={op.sendMax} asset={op.sendAsset}/>
                <span className="fa fa-space fa-random"/>
                {op.path.map((asset, i) => <span key={i}>
                    <AssetLink asset={asset} compact/>
                    <span className="fa fa-space fa-random"/>
                </span>)}
                <Amount amount={op.destAmount} asset={op.destAsset}/> to <Address account={op.destination} compact/>
                <SourceAccount op={op} source={source}/>.
            </span>
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
                return <span><b>{action}</b> #{op.offerId}<SourceAccount op={op} source={source}/>.</span>
            } else {
                return <span>
                    <b>{action} {op.offerId > 0 && ('#' + op.offerId)} {direction}</b>{' '}
                    <Amount amount={op.amount} asset={op.selling}/> for <AssetLink asset={op.buying} compact/>{' '}
                    at <b>{op.price}</b> {op.buying.code}/{op.selling.code} <SourceAccount op={op} source={source}/>.
                </span>
            }
        }
        case 'createPassiveSellOffer':
        case 'createPassiveBuyOffer': {
            const direction = op.type === 'manageSellOffer' ? 'sell' : 'buy'
            return <span>
                    <b>Create passive {direction} offer</b> <Amount amount={op.amount} asset={op.selling}/> for{' '}
                <AssetLink asset={op.buying} compact/> at <b>{op.price}</b> {op.buying.code}/{op.selling.code}
                <SourceAccount op={op} source={source}/>.
                </span>
        }
        case 'setOption':
        case 'setOptions':
            return <span>
                <b>Set options</b><SourceAccount op={op} source={source}/>
                {op.setFlags && (op.setFlags & 1) ?
                    <span><br/>Set trustline authorization required flag.</span> : null}
                {op.setFlags && (op.setFlags & 2) ?
                    <span><br/>Set trustline authorization revocable flag.</span> : null}
                {op.clearFlags && (op.clearFlags & 1) ?
                    <span><br/>Clear trustline authorization required flag.</span> : null}
                {op.clearFlags && (op.clearFlags & 2) ?
                    <span><br/>Clear trustline authorization revocable flag.</span> : null}
                {op.homeDomain !== undefined && <span><br/>Set home domain {op.homeDomain ?
                    <a href={'http://' + op.homeDomain}
                       target="_blank">{op.homeDomain}</a> : 'not set'}.</span>}
                {op.inflationDest !== undefined && <span><br/>Set inflation destination to <Address
                    account={op.inflationDest} compact/>.</span>}
                {op.lowThreshold !== undefined &&
                <span><br/>Set low threshold to {op.lowThreshold}.</span>}
                {op.medThreshold !== undefined &&
                <span><br/>Set medium threshold to {op.medThreshold}.</span>}
                {op.highThreshold !== undefined &&
                <span><br/>Set high threshold to {op.highThreshold}.</span>}
                {op.signer && <span><br/>Add new signer <Address account={op.signer.ed25519PublicKey}
                                                                 compact/> with weight {op.signer.weight}.</span>}
                {op.masterWeight !== undefined && <span><br/>Set master key weight to {op.masterWeight}.</span>}
            </span>
        case 'changeTrust':
            if (parseFloat(op.limit) > 0)
                return <span>
                    <b>Create trustline</b> to <AssetLink
                    asset={op.line} compact/> with limit <Amount amount={op.limit} asset={op.line} compact/>
                    <SourceAccount op={op} source={source}/>.
            </span>
            return <span>
                    <b>Remove trustline</b> to <AssetLink asset={op.line} compact/>
                    <SourceAccount op={op} source={source}/>.
                </span>
        case 'allowTrust':
            asset = {code: op.assetCode, issuer: op.source || source}
            if (op.authorize) return <span>
                <b>Allow trustline</b> <AssetLink asset={asset} compact/> for account <Address account={op.trustor}
                                                                                               compact/>
                <SourceAccount op={op} source={source}/>.
            </span>
            return <span>
                <b>Disallow trustline</b> <AssetLink asset={asset} compact/> for account <Address account={op.trustor}
                                                                                                  compact/>
                <SourceAccount op={op} source={source}/>.
            </span>
        case 'accountMerge':
            return <span>
                <b>Merge account</b> <Address account={op.source || source} compact/> into account <Address
                account={op.destination} compact/>
                <SourceAccount op={op} source={source}/>.
            </span>
        case 'inflation':
            return <span>
                <b>Run inflation</b><SourceAccount op={op} source={source}/>.
            </span>
        case 'manageDatum':
        case 'manageData':
            if (!op.value) return <span>
                    <b>Delete data entry</b> "{op.name}" for account <Address account={op.source || source} compact/>.
            </span>
            return <span>
                <b>Add data entry</b> "{op.name}"="{op.value}" for account <Address account={op.source || source}
                                                                                    compact/>.
            </span>
        case 'bumpSequence':
            return <span>
                <b>Bump account sequence</b> to {op.sequence} <SourceAccount op={op} source={source}/>.
            </span>
    }
    throw new Error(`Not supported operation type: ${op.type}.`)
}

OperationDescriptionView.propTypes = {
    op: PropTypes.object.isRequired,
    source: PropTypes.string.isRequired
}

export default OperationDescriptionView