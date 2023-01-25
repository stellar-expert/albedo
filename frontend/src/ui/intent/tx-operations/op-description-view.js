import React from 'react'
import {AuthRequiredFlag, AuthRevocableFlag, AuthClawbackEnabledFlag, AuthImmutableFlag} from 'stellar-sdk'
import {
    AccountAddress,
    AccountIdenticon,
    Amount,
    AssetLink,
    ClaimableBalanceClaimants,
    OfferLink,
    SignerKey,
    useAssetMeta,
    useStellarNetwork,
    formatExplorerLink
} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {formatPrice, formatWithAutoPrecision} from '@stellar-expert/formatter'

function formatBalanceId(balance) {
    return `${balance.substr(8, 4)}…${balance.substr(-4)}`
}

function getAccountPredefinedDisplayName(address) {
    if (!window.predefinedAccountDisplayNames) return undefined
    return window.predefinedAccountDisplayNames[address]
}

/**
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function OpSourceAccount({op, compact}) {
    const network = useStellarNetwork()
    const {source} = op.operation
    const txSource = op.tx.tx.source
    if (op.isEphemeral && (!source || source === txSource))
        return null
    const predefined = getAccountPredefinedDisplayName(source)
    const accountItem = predefined ?
        <a href={formatExplorerLink('account', source, network)} target="_blank" rel="nofollow noreferrer">
            <AccountIdenticon address={source}/> {predefined}
        </a> :
        <AccountAddress account={source}/>

    if (!op.isEphemeral)
        return accountItem
    return <> on behalf of account {accountItem}</>
}


/**
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function CreateAccountDescriptionView({op, compact}) {
    const {destination, startingBalance} = op.operation
    return op.isEphemeral ? <>
        <b>Create account</b> <AccountAddress account={destination}/>{' '}
        with starting balance <Amount amount={startingBalance} asset="XLM" issuer={!compact}/>
        <OpSourceAccount op={op}/>
    </> : <>
        <OpSourceAccount op={op}/> created account <AccountAddress account={destination}/>{' '}
        with starting balance <Amount amount={startingBalance} asset="XLM" issuer={!compact}/>
    </>
}

/**
 * Type: 1
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function PaymentDescriptionView({op, compact}) {
    const {destination, asset, amount} = op.operation
    return op.isEphemeral ? <>
        <b>Send</b> <Amount amount={amount} asset={asset}/> to <AccountAddress account={destination}/>
        <OpSourceAccount op={op}/>
    </> : <>
        <OpSourceAccount op={op}/> sent{' '}
        <Amount amount={amount} asset={AssetDescriptor.parse(asset)} issuer={!compact}/> to{' '}
        <AccountAddress account={destination}/>
    </>
}

/**
 * Type: 2, 13
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function PathPaymentDescriptionView({op, compact}) {
    const {source, destination, sendAsset, sendMax, sendAmount, destAsset, destAmount, destMin, path, effects} = op.operation
    const isSwap = source === destination
    let src = sendAmount || sendMax
    let dst = destMin || destAmount
    const pathData = <>
        <i className="icon icon-shuffle color-primary"/>{' '}
        {!compact && path.map((asset, i) => <span key={i + '-' + asset.toString()}>
            <AssetLink asset={asset}/> <i className="icon icon-shuffle color-primary"/>{' '}
        </span>)}
    </>
    if (op.isEphemeral)
        return <>
            <b>{isSwap ? 'Swap' : 'Send'}</b> <Amount amount={src} asset={sendAsset} issuer={!compact}/>{' '}
            {pathData}
            <Amount amount={dst} asset={destAsset} issuer={!compact}/>
            {!isSwap && <> to <AccountAddress account={destination}/></>}
            <OpSourceAccount op={op}/>
        </>
    if (sendMax > 0) {
        src = effects.find(e => e.type === 'accountDebited').amount
    }
    if (destMin > 0) {
        dst = effects.find(e => e.type === 'accountCredited').amount
    }
    return <>
        <OpSourceAccount op={op}/> {isSwap ? 'swapped ' : 'sent '}
        <Amount amount={src} asset={sendAsset} issuer={!compact}/>{' '}
        {!compact && sendMax > 0 && <><span className="dimmed nowrap">
            (max <Amount amount={sendMax} asset={AssetDescriptor.parse(sendAsset)}/>)
        </span> </>}
        {pathData}
        <Amount amount={dst} asset={AssetDescriptor.parse(destAsset)} issuer={!compact}/>{' '}
        {!compact && destMin > 0 && <><span className="dimmed nowrap">
            (min <Amount amount={destMin} asset={AssetDescriptor.parse(destAsset)}/>)
        </span> </>}
        {!isSwap && <>to <AccountAddress account={destination}/></>}
    </>
}

/**
 * Type: 3, 4, 12
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ManageOfferDescriptionView({op, compact}) {
    let {offerId, amount, buyAmount, selling, buying, price, type} = op.operation
    const passive = type === 'createPassiveSellOffer'
    const isCancelled = !passive && offerId > 0 && parseFloat(amount || buyAmount) === 0

    const direction = type === 'manageBuyOffer' ? ' buy' : ' sell'
    let description = ''
    if (offerId > 0) { //manage existing offer
        description = 'Update'
    } else {
        description = 'Create'
    }
    if (!op.isEphemeral) {
        description += 'd'
    }
    if (passive) {
        description += ' passive'
    }
    description += direction + ' offer'
    const amountInfo = <>
        {amount !== undefined ?
            <Amount amount={amount} asset={selling} issuer={!compact}/> :
            <AssetLink asset={selling} issuer={!compact}/>}{' '}
        <i className="icon icon-shuffle color-primary"/>{' '}
        {buyAmount !== undefined ?
            <Amount amount={buyAmount} asset={buying} issuer={!compact}/> :
            <AssetLink asset={buying} issuer={!compact}/>}{' '}
        at <span className="nowrap">
            {formatWithAutoPrecision(price)} {AssetDescriptor.parse(buying).toCurrency()}/{AssetDescriptor.parse(selling).toCurrency()}
        </span>
    </>
    if (op.isEphemeral) {
        if (isCancelled)
            return <>
                <b>Cancel DEX offer</b> #<OfferLink offer={offerId}/><OpSourceAccount op={op}/>
            </>
        return <>
            <b>{description}</b> {offerId > 0 && <>#<OfferLink offer={offerId}/></>} {amountInfo}<OpSourceAccount op={op}/>
        </>
    }

    if (isCancelled)
        return <>
            <OpSourceAccount op={op}/> cancelled DEX offer <OfferLink offer={offerId}/>
        </>
    return <>
        <OpSourceAccount op={op}/> {description.toLowerCase()} {offerId > 0 && <OfferLink offer={offerId}/>} {amountInfo}
    </>
}

function AccountFlags({flags}) {
    if (!flags)
        return null
    const res = []
    if (flags & AuthRequiredFlag) {
        res.push('auth_required')
    }
    if (flags & AuthRevocableFlag) {
        res.push('auth_revocable')
    }
    if (flags & AuthImmutableFlag) {
        res.push('auth_immutable')
    }
    if (flags & AuthClawbackEnabledFlag) {
        res.push('auth_clawback_enabled')
    }
    return <>
        {res.map((f, i) => <span key={f}>{i > 0 && <>, </>}<code>{f}</code></span>)} flag{res.length > 1 && <>s</>}
    </>
}

/**
 * Type: 5
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function SetOptionsDescriptionView({op, compact}) {
    const {
        setFlags,
        clearFlags,
        homeDomain,
        inflationDest,
        lowThreshold,
        medThreshold,
        highThreshold,
        signer,
        masterWeight,
        order,
        txHash
    } = op.operation

    const settings = []
    if (!!setFlags) {
        settings.push(<>Set <AccountFlags flags={setFlags}/></>)
    }
    if (!!clearFlags) {
        settings.push(<>Unset <AccountFlags flags={clearFlags}/></>)
    }
    if (homeDomain !== undefined) {
        settings.push(homeDomain ? <>Set home domain <code className="nowrap">{homeDomain}</code></> : <>Reset home domain</>)
    }
    if (inflationDest !== undefined) {
        settings.push(<>Set inflation destination to <AccountAddress account={inflationDest}/></>)
    }
    if (lowThreshold !== undefined || medThreshold !== undefined || highThreshold !== undefined) {
        const thresholds = []
        if (lowThreshold !== undefined) {
            thresholds.push('low=' + lowThreshold)
        }
        if (medThreshold !== undefined) {
            thresholds.push('medium=' + medThreshold)
        }
        if (highThreshold !== undefined) {
            thresholds.push('high=' + highThreshold)
        }
        settings.push(<>Set thresholds {thresholds.map((t, i) => <span key={i + t}>{i > 0 && <>, </>}<code>{t}</code></span>)}</>)
    }
    if (masterWeight !== undefined) {
        settings.push(<>Set master key weight to <code>{masterWeight}</code></>)
    }
    if (signer !== undefined) {
        if (signer.weight > 0) {
            settings.push(<>Add account signer <SignerKey signer={signer}/></>)
        } else {
            settings.push(<>Remove account signer <SignerKey signer={signer} showWeight={false}/></>)
        }
    }
    const details = <div className="block-indent text-small">
        {settings.map((s, i) => <div key={txHash + order + i}>{s}</div>)}
    </div>
    if (op.isEphemeral)
        return <>
            <b>Set account options</b><OpSourceAccount op={op}/>
            {details}
        </>
    return <>
        <OpSourceAccount op={op}/> updated account options.
        <div className="block-indent">
            {details}
        </div>
    </>
}

/**
 * Type: 6
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ChangeTrustDescriptionView({op, compact}) {
    const {line, limit, effects} = op.operation
    const trustAsset = AssetDescriptor.parse(line)
    const established = limit > 0
    if (op.isEphemeral) {
        if (established)
            return <>
                <b>Establish trustline</b> to <AssetLink asset={trustAsset} issuer={!compact}/>
                {limit !== '922337203685.4775807' && <> with limit <Amount amount={limit} asset={trustAsset} issuer={!compact}/></>}
                <OpSourceAccount op={op}/>
            </>
        return <>
            <b>Remove trustline</b> to <AssetLink asset={trustAsset} issuer={!compact}/><OpSourceAccount op={op}/>
        </>
    }
    if (established) {
        const description = effects.some(e => e.type === 'trustlineCreated') ? 'established' : 'updated'
        return <>
            <OpSourceAccount op={op}/> {description} trustline to <AssetLink asset={line} issuer={!compact}/>
            {limit !== '922337203685.4775807' && <> with limit <Amount amount={limit} asset={line} issuer={!compact}/></>}
        </>
    }
    return <>
        <OpSourceAccount op={op}/> removed trustline to <AssetLink asset={line} issuer={!compact}/>
    </>
}

/**
 * Type: 7
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function AllowTrustDescriptionView({op, compact}) {
    const {source, assetCode, trustor, authorize} = op.operation
    const asset = AssetDescriptor.parse({code: assetCode, issuer: source})

    let description = authorize ? 'Authorize' : 'Deauthorize'
    if (op.isEphemeral)
        return <>
            <b>{description} trustline</b> <AssetLink asset={asset} issuer={!compact}/> for account <AccountAddress account={trustor}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> {description.toLowerCase() + 'd'} trustline{' '}
        <AssetLink asset={asset} issuer={!compact}/> for account <AccountAddress account={trustor}/>
    </>
}

/**
 * Type: 8
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function MergeAccountDescriptionView({op, compact}) {
    const {destination} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Merge account</b> <OpSourceAccount op={op}/> into account <AccountAddress account={destination}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> merged into account <AccountAddress account={destination}/>
    </>
}

/**
 * Type: 9
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function InflationDescriptionView({op, compact}) {
    if (op.isEphemeral)
        return <>
            <b>Initiate inflation</b><OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> initiated inflation
    </>
}

/**
 * Type: 10
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ManageDataDescriptionView({op, compact}) {
    const {name, value, effects} = op.operation
    const dataEntryDesc = <span className="word-break condensed text-small">
        <code>"{name}"</code>
        {!!value && <> = <code>"{value}"</code></>}
    </span>

    if (op.isEphemeral) {
        const descr = !value ? 'Delete' : 'Set'
        return <>
            <b>{descr} data entry</b> {dataEntryDesc}<OpSourceAccount op={op}/>
        </>
    }
    let descr = !value ? 'deleted' : 'set'
    if (effects.some(e => e.type === 'dataEntryUpdated')) {
        descr = 'updated'
    }
    return <>
        <OpSourceAccount op={op}/> {descr} data entry {dataEntryDesc}
    </>
}

/**
 * Type: 11
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function BumpSequenceDescriptionView({op, compact}) {
    const {bumpTo} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Bump account sequence</b> to {bumpTo}<OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> bumped account sequence to {bumpTo}
    </>
}

/**
 * Type: 14
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function CreateClaimableBalanceDescriptionView({op, compact}) {
    const {asset, amount, claimants} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Create claimable balance</b> <Amount amount={amount} asset={AssetDescriptor.parse(asset)} issuer={!compact}/>
            <OpSourceAccount op={op}/>{' '}
            for claimants <ClaimableBalanceClaimants claimants={claimants}/>

        </>
    return <>
        <OpSourceAccount op={op}/> created claimable balance{' '}
        <Amount amount={amount} asset={AssetDescriptor.parse(asset)} issuer={!compact}/>{' '}
        for claimants <ClaimableBalanceClaimants claimants={claimants}/>
    </>
}

/**
 * Type: 15
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ClaimClaimableBalanceDescriptionView({op, compact}) {
    const {balanceId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Claim balance</b> <code>{formatBalanceId(balanceId)}</code>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> claimed balance <code>{formatBalanceId(balanceId)}</code>
    </>
}

/**
 * Type: 16
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function BeginSponsoringFutureReservesDescriptionView({op, compact}) {
    const {sponsoredId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Sponsor reserves</b> for <AccountAddress account={sponsoredId}/><OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> sponsored reserves for <AccountAddress account={sponsoredId}/>
    </>
}

/**
 * Type: 17
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function EndSponsoringFutureReservesDescriptionView({op, compact}) {
    if (op.isEphemeral)
        return <>
            <b>Finish sponsoring reserves</b><OpSourceAccount op={op}/>
        </>
    return <>
        Finished sponsoring reserves for <OpSourceAccount op={op}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeAccountSponsorshipDescriptionView({op, compact}) {
    const {account} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> for account <AccountAddress account={account}/><OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship for account <AccountAddress account={account}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeSignerSponsorshipDescriptionView({op, compact}) {
    const {account, signer} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on signer <SignerKey signer={signer} showWeight={false}/>{' '}
            for account <AccountAddress account={account}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on signer <SignerKey signer={signer} showWeight={false}/>
        {' '}for account <AccountAddress account={account}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeTrustlineSponsorshipDescriptionView({op, compact}) {
    const {account, asset} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on <AssetLink asset={asset} issuer={!compact}/> trustline for account{' '}
            <AccountAddress account={account}/><OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on <AssetLink asset={asset} issuer={!compact}/> trustline for account{' '}
        <AccountAddress account={account}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeOfferSponsorshipDescriptionView({op, compact}) {
    const {seller, offerId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on offer <OfferLink offer={offerId}/> for account <AccountAddress account={seller}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on offer <OfferLink offer={offerId}/>{' '}
        for account <AccountAddress account={seller}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeDataSponsorshipDescriptionView({op, compact}) {
    const {account, name} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on data entry <code>{name}</code> for account <AccountAddress account={account}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on data entry <code>{name}</code> for account{' '}
        <AccountAddress account={account}/>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeClaimableBalanceSponsorshipDescriptionView({op, compact}) {
    const {balanceId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on claimable balance <code>{formatBalanceId(balanceId)}</code>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on claimable balance <code>{formatBalanceId(balanceId)}</code>
    </>
}

/**
 * Type: 18
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function RevokeLiquidityPoolSponsorshipDescriptionView({op, compact}) {
    const {liquidityPoolId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Revoke sponsorship</b> on liquidity pool <AssetLink asset={liquidityPoolId} issuer={!compact}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> revoked sponsorship on liquidity pool <AssetLink asset={liquidityPoolId} issuer={!compact}/>
    </>
}

/**
 * Type: 19
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ClawbackDescriptionView({op, compact}) {
    const {from, amount, asset} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Clawback</b> <Amount amount={amount} asset={asset} issuer={!compact}/> from <AccountAddress account={from}/>
            <OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> clawedback <Amount asset={asset} amount={amount} issuer={!compact}/> from <AccountAddress
        account={from}/>
    </>
}

/**
 * Type: 20
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function ClawbackClaimableBalanceDescriptionView({op, compact}) {
    const {balanceId} = op.operation
    if (op.isEphemeral)
        return <>
            <b>Clawback claimable balance</b> <code>{formatBalanceId(balanceId)}</code><OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> clawedback claimable balance <code>{formatBalanceId(balanceId)}</code>
    </>
}

/**
 * Type: 21
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function SetTrustLineFlagsDescriptionView({op, compact}) {
    const {trustor, asset, flags} = op.operation
    const flagsMapping = {
        authorized: 'authorized',
        authorizedToMaintainLiabilities: 'authorized to maintain liabilities',
        clawbackEnabled: 'clawback enabled'
    }
    const setFlags = []
    const clearFlags = []
    for (let flag of Object.keys(flagsMapping)) {
        const container = flags[flag] ? setFlags : clearFlags
        container.push(flagsMapping[flag])
    }
    const flagsInfo = <>
        <code>[{setFlags.join(', ')}]</code>
        {clearFlags.length > 0 && <span>, clear{!op.isEphemeral && 'ed'} flags <code>[{clearFlags.join(', ')}]</code></span>}{' '}
        on asset <AssetLink asset={asset} issuer={!compact}/> for account <AccountAddress account={trustor}/>
    </>
    if (op.isEphemeral)
        return <>
            <b>Set trustline flags</b> {flagsInfo}<OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> set trustline flags {flagsInfo}
    </>
}

/**
 * Type: 22
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function DepositLiquidityDescriptionView({op, compact}) {
    const {liquidityPoolId, maxAmountA, maxAmountB, minPrice, maxPrice} = op.operation
    const meta = useAssetMeta(liquidityPoolId)
    const [assetA, assetB] = meta?.assets || ['tokens A', 'tokens B']
    const depositInfo = <>
        <Amount asset={assetA} amount={maxAmountA} issuer={!compact}/> and {' '}
        <Amount asset={assetB} amount={maxAmountB} issuer={!compact}/> to the pool{' '}
        <AssetLink asset={liquidityPoolId} issuer={!compact}/>{' '}
        {!compact && <span className="dimmed">(price range {formatPrice(minPrice)} - {formatPrice(maxPrice)})</span>}
    </>
    if (op.isEphemeral)
        return <>
            <b>Deposit liquidity</b> {depositInfo}<OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> deposited liquidity {depositInfo}
    </>
}

/**
 * Type: 23
 * @param {OperationDescriptor} op
 * @param {Boolean} compact
 * @constructor
 */
function WithdrawLiquidityDescriptionView({op, compact}) {
    const {liquidityPoolId, amount, minAmountA, minAmountB} = op.operation
    const meta = useAssetMeta(liquidityPoolId)
    const [assetA, assetB] = meta?.assets || ['tokens A', 'tokens B']
    const withdrawInfo = <>
        {formatWithAutoPrecision(amount)} shares from the pool <AssetLink asset={liquidityPoolId} issuer={!compact}/>{' '}
        {!compact && <span className="dimmed">
            (minimum <Amount asset={assetA} amount={minAmountA}/> + <Amount asset={assetB} amount={minAmountB}/>)
        </span>}
    </>
    if (op.isEphemeral)
        return <>
            <b>Withdraw liquidity</b> {withdrawInfo}<OpSourceAccount op={op}/>
        </>
    return <>
        <OpSourceAccount op={op}/> withdrew {withdrawInfo}
    </>
}

const typeMapping = {
    createAccount: CreateAccountDescriptionView,
    payment: PaymentDescriptionView,
    pathPaymentStrictReceive: PathPaymentDescriptionView,
    manageSellOffer: ManageOfferDescriptionView,
    createPassiveSellOffer: ManageOfferDescriptionView,
    setOptions: SetOptionsDescriptionView,
    changeTrust: ChangeTrustDescriptionView,
    allowTrust: AllowTrustDescriptionView,
    accountMerge: MergeAccountDescriptionView,
    inflation: InflationDescriptionView,
    manageData: ManageDataDescriptionView,
    bumpSequence: BumpSequenceDescriptionView,
    manageBuyOffer: ManageOfferDescriptionView,
    pathPaymentStrictSend: PathPaymentDescriptionView,
    createClaimableBalance: CreateClaimableBalanceDescriptionView,
    claimClaimableBalance: ClaimClaimableBalanceDescriptionView,
    beginSponsoringFutureReserves: BeginSponsoringFutureReservesDescriptionView,
    endSponsoringFutureReserves: EndSponsoringFutureReservesDescriptionView,
    revokeAccountSponsorship: RevokeAccountSponsorshipDescriptionView,
    revokeTrustlineSponsorship: RevokeTrustlineSponsorshipDescriptionView,
    revokeOfferSponsorship: RevokeOfferSponsorshipDescriptionView,
    revokeDataSponsorship: RevokeDataSponsorshipDescriptionView,
    revokeClaimableBalanceSponsorship: RevokeClaimableBalanceSponsorshipDescriptionView,
    revokeLiquidityPoolSponsorship: RevokeLiquidityPoolSponsorshipDescriptionView,
    revokeSignerSponsorship: RevokeSignerSponsorshipDescriptionView,
    clawback: ClawbackDescriptionView,
    clawbackClaimableBalance: ClawbackClaimableBalanceDescriptionView,
    setTrustLineFlags: SetTrustLineFlagsDescriptionView,
    liquidityPoolDeposit: DepositLiquidityDescriptionView,
    liquidityPoolWithdraw: WithdrawLiquidityDescriptionView
}

/**
 * Text description of a tx operation
 * @param {OperationDescriptor} op
 * @param {Boolean} compact?
 * @constructor
 */
export function OpDescriptionView({op, compact = false}) {
    const render = typeMapping[op.operation.type]
    if (!render) {
        console.warn(`No operation text type mapping for operation ${op.operation.type}`)
        return null
    }
    return React.createElement(render, {op, compact})
}