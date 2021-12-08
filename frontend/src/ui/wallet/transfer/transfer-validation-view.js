import React from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {AssetDescriptor, useStellarNetwork} from '@stellar-expert/ui-framework'
import {requestFriendbotFunding} from '../../../util/horizon-connector'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'

function createTestnetAccount() {
    requestFriendbotFunding(accountLedgerData.address)
        .then(() => accountLedgerData.loadAccountInfo())
}

function canReceive(destination, asset) {
    if (destination.nonExisting) return false
    if (asset === 'XLM') return true //TODO: check minimal balance
    if (!destination.balancesMap || !destination.balancesMap[asset]) return false
    if (destination.id === AssetDescriptor.parse(asset).issuer) return true
    return true
}

function validate(network, destination, transfer, directoryInfo) {
    if (transfer.destinationFederationAddress && !transfer.destination) return <>
        Failed to resolve recipient public key from the federation address "{transfer.destinationFederationAddress}".
        Please check whether you copied it correctly.
    </>

    if (transfer.invalidMemo) return <>
        Invalid memo format. Please check the value.
    </>

    if (!destination || !transfer.asset[1] || !parseFloat(transfer.amount[0]) || !parseFloat(transfer.amount[1])) return false

    const assetCode = transfer.asset[1].split('-')[0]

    function setCreateDestination() {
        runInAction(() => transfer.createDestination = true)
    }

    function switchToClaimableBalance() {
        transfer.setMode('claimable')
    }

    if (directoryInfo?.tags?.includes('malicious')) return <>
        The payment is blocked because the recipient account has been reported for malicious activity.
    </>

    if (accountLedgerData.nonExisting) return <>
        The account does not exist on the ledger.
        <br/>
        {network === 'testnet' &&
        <a href="#" onClick={createTestnetAccount}>Create a <b>testnet</b> account automatically?</a>}
    </>

    if (!transfer.hasSufficientBalance) return <>
        Insufficient balance on your account. Please adjust the amount of tokens to send.
    </>

    if (transfer.mode === 'claimable') return null

    if (transfer.source !== transfer.destination) { //external payment
        if (transfer.asset[1] !== 'XLM') {
            if (!canReceive(destination, transfer.asset[1])) return <>
                The recipient account does not have a trustline to {assetCode} and cannot
                receive the payment. Yet you still can send tokens using a{' '}
                <a href="#" onClick={switchToClaimableBalance}>claimable balance</a>.
            </>
        } else if (destination.nonExisting && !transfer.createDestination)
            return <>
                The recipient account does not exist on the ledger.
                Would you like to <a href="#" onClick={setCreateDestination}>create it</a> before transferring funds?
            </>

        if ((destination.data || {}) ['config.memo_required'] || directoryInfo?.tags?.includes('memo-required'))
            if (!transfer.memo)
                return <>The recipient account requires a valid transaction memo for incoming payments. Please check
                    deposit
                    instructions and provide a memo, otherwise the payment may be lost.</>
        if (transfer.createDestination && parseInt(transfer.amount[1]) < 1) return <>
            In order to create the recipient account on the ledger, you need to send at least 1 XLM (preferably 2-5 XLM
            to cover future trustlines reserves and transaction fee expenses for the destination account).
        </>
    } else { //self payment
        function setCreateTrustline() {
            runInAction(() => transfer.createTrustline = true)
        }

        if (!accountLedgerData.balances[transfer.asset[1]] && !transfer.createTrustline) return <>
            You need to establish a trustline to {assetCode} before trading it.
            Would you like to <a href="#" onClick={setCreateTrustline}>create the trustline</a>?
            This action will temporarily lock 0.5 XLM on your account balance.
        </>
    }

    return null
}

function TransferValidationView({destination, transfer, directoryInfo, onValidate}) {
    const _ = {...transfer},
        network = useStellarNetwork(),
        validationResult = validate(network, destination, transfer, directoryInfo)
    setTimeout(() => onValidate(validationResult === null), 100)
    if (!validationResult) return null
    return <p className="warning text-small micro-space">
        <i className="icon-warning"/> {validationResult}
    </p>
}

export default observer(TransferValidationView)