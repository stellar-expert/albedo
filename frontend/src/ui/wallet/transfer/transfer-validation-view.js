import React from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {StrKey} from '@stellar/stellar-base'
import {useStellarNetwork} from '@stellar-expert/ui-framework'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import accountLedgerData, {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import {requestFriendbotFunding} from '../../../util/horizon-connector'

function createTestnetAccount() {
    requestFriendbotFunding(accountLedgerData.address)
        .then(() => accountLedgerData.loadAccountInfo())
}

function canReceive(destination, asset) {
    if (destination.nonExisting) return false
    if (asset === 'XLM') return true //TODO: check minimal balance
    if (destination.id === AssetDescriptor.parse(asset).issuer) return true
    if (!destination.balancesMap || !destination.balancesMap[asset]) return false
    return true
}

/**
 * @param {String} network
 * @param {TransferSettings} transfer
 * @param {Object} [directoryInfo]
 * @return {JSX.Element|boolean|null}
 */
function validate(network, transfer, directoryInfo) {
    const selfTransfer = transfer.source === transfer.destination
    const isContract = StrKey.isValidContract(transfer.destination)
    const destinationInfo = useDestinationAccountLedgerData(!selfTransfer && !isContract ? transfer.destination : '')
    if (transfer.destinationFederationAddress && !transfer.destination) {
        const type = transfer.destinationFederationAddress.endsWith('.xlm') ? 'SorobanDomains' : 'federation'
        return <>
            Failed to resolve recipient public key from the {type} address "{transfer.destinationFederationAddress}".
            Please check whether you copied it correctly.
        </>
    }

    if (transfer.invalidMemo)
        return <>Invalid memo format. Please check the value.</>

    if ((!destinationInfo && !selfTransfer && !isContract))
        return false

    const destAsset = transfer.asset[1]
    if (!transfer.asset[1] || !parseFloat(transfer.amount[0]) || !parseFloat(transfer.amount[1]))
        return false

    const assetCode = destAsset.split('-')[0]

    function setCreateDestination() {
        runInAction(() => transfer.createDestination = true)
    }

    if (directoryInfo?.tags?.includes('malicious'))
        return <>The payment is blocked because the recipient account has been reported for malicious activity.</>

    if (accountLedgerData.nonExisting)
        return <>
            The account does not exist on the ledger.
            <br/>
            {network === 'testnet' &&
                <a href="#" onClick={createTestnetAccount}>Create a <b>testnet</b> account automatically?</a>}
        </>

    if (!transfer.hasSufficientBalance)
        return <>Insufficient balance on your account.</>

    if (isContract) {
        switch (transfer.mode) {
            case 'direct':
                return true //skip further validation for contract destinations
            case 'claimable':
                return <>Cannot create claimable balances for smart contracts.</>
            case 'convert':
                return <>Cannot use auto-conversion with smart contracts.</>
            default:
                return <>Unknown transfer mode: {transfer.mode}.</>
        }
    }

    if (transfer.mode === 'claimable')
        return true

    if (!selfTransfer) { //external payment
        if (destAsset !== 'XLM') {
            if (!canReceive(destinationInfo, destAsset))
                return <>
                    The recipient account does not have a trustline to {assetCode} and cannot
                    receive the payment. Yet you still can send tokens using a{' '}
                    <a href="#" onClick={() => transfer.setMode('claimable')}>claimable balance</a>.
                </>
        } else if (destinationInfo.nonExisting && !transfer.createDestination)
            return <>
                The recipient account does not exist on the ledger.
                Would you like to <a href="#" onClick={setCreateDestination}>create it</a> before transferring funds?
            </>

        if ((destinationInfo.data || {}) ['config.memo_required'] || directoryInfo?.tags?.includes('memo-required'))
            if (!transfer.memo)
                return <>The recipient account requires a valid transaction memo for incoming payments. Please check
                    deposit instructions and provide a memo, otherwise the payment may be lost.</>
        if (transfer.createDestination && parseInt(transfer.amount[1]) < 1)
            return <>
                In order to create the recipient account on the ledger, you need to send at least 1 XLM (preferably 2-5 XLM
                to cover future trustlines reserves and transaction fee expenses for the destination account).
            </>
    } else { //self payment
        function setCreateTrustline() {
            runInAction(() => transfer.createTrustline = true)
        }

        if (transfer.asset[0] === transfer.asset[1])
            return false

        if (!accountLedgerData.balances[transfer.asset[1]] && !transfer.createTrustline)
            return <>
                You need to establish a trustline to {assetCode} before trading it.
                Would you like to <a href="#" onClick={setCreateTrustline}>create the trustline</a>?
                This action will temporarily lock 0.5 XLM on your account balance.
            </>
    }
    return true
}

function TransferValidationView({transfer, directoryInfo}) {
    Object.values(transfer)
    const network = useStellarNetwork()
    const validationResult = validate(network, transfer, directoryInfo)
    if (validationResult === true) {
        setTimeout(() => runInAction(() => transfer.isValid = true), 100)

        return null
    }
    setTimeout(() => runInAction(() => transfer.isValid = false), 100)
    if (validationResult === false) {
        return null
    }

    return <div className="segment segment-inline warning segment text-small space">
        <i className="icon-warning"/> {validationResult}
    </div>
}

export default observer(TransferValidationView)