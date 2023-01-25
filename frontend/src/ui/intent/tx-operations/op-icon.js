import React from 'react'

const opIconMapping = {
    feeCharge: 'send-circle',
    createAccount: 'hexagon-add',
    payment: 'send-circle',
    paymentReceive: 'receive-circle',
    pathPaymentStrictReceive: 'swap',
    manageSellOffer: 'dex-offer',
    createPassiveSellOffer: 'dex-offer',
    setOptions: 'hexagon-set-options',
    changeTrust: 'trustlines',
    changeTrustAdd: 'create-trustline',
    changeTrustRemove: 'remove-trustline',
    changeTrustUpdate: 'trustline-flags',
    allowTrust: 'trustline-flags',
    accountMerge: 'hexagon-remove',
    accountMergeReceive: 'receive-circle',
    inflation: 'hexagon-inflation',
    manageData: 'grid',
    manageDataAdd: 'grid-add',
    manageDataRemove: 'grid-remove',
    bumpSequence: 'upload',
    manageBuyOffer: 'dex-offer',
    pathPaymentStrictSend: 'swap',
    createClaimableBalance: 'shutdown-circle',
    claimClaimableBalance: 'icon-ok',
    claimClaimableBalanceReceive: 'receive-circle',
    beginSponsoringFutureReserves: 'sponsor',
    endSponsoringFutureReserves: 'sponsor',
    revoke: 'revoke',
    revokeAccountSponsorship: 'revoke',
    revokeTrustlineSponsorship: 'revoke',
    revokeOfferSponsorship: 'revoke',
    revokeDataSponsorship: 'revoke',
    revokeClaimableBalanceSponsorship: 'revoke',
    revokeLiquidityPoolSponsorship: 'revoke',
    revokeSignerSponsorship: 'revoke',
    clawback: 'clawback',
    clawbackReceive: 'send-circle',
    clawbackClaimableBalance: 'icon-ok',
    setTrustLineFlags: 'trustline-flags',
    liquidityPoolDeposit: 'droplet',
    liquidityPoolWithdraw: 'droplet-half'
}

/**
 * Transaction operation icon
 * @param {OperationDescriptor|'feeCharge'} op - Operation descriptor
 * @constructor
 */
export function OpIcon({op}) {
    let type
    if (op === 'feeCharge') {
        type = 'feeCharge'
    } else {
        const {operation} = op
        type = operation.type
        switch (type) {
            case 'payment':
            case 'accountMerge':
            case 'claimClaimableBalance':
            case 'clawback':
                if (op.context && op.contextType === 'account' && operation.source !== op.context) {
                    type += 'Receive'
                }
                break
            case 'manageData':
                if (operation.effects.some(e => e.type === 'dataEntryCreated')) {
                    type += 'Add'
                } else if (operation.effects.some(e => e.type === 'dataEntryRemoved')) {
                    type += 'Remove'
                }
                break
            case 'changeTrust':
                if (operation.limit > 0) {
                    type += 'Add'
                } else {
                    type += 'Remove'
                }
                break
        }
    }


    const icon = opIconMapping[type]
    return <div className="op-icon">
        <i className={`icon-${icon}`}/>
    </div>
}