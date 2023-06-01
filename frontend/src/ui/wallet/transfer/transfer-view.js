import React, {useEffect, useState} from 'react'
import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import {AccountAddress, Tabs, useDependantState, useDirectory, useStellarNetwork} from '@stellar-expert/ui-framework'
import {parseQuery, navigation} from '@stellar-expert/navigation'
import accountLedgerData, {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import SwapSlippageView from '../shared/slippage-view'
import TransferAmountView from '../shared/transfer-amount-view'
import AvailableAmountLink from '../shared/available-amount-link-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TxMemoView from '../tx/tx-memo-view'
import SwapBandView from '../swap/swap-band-view'
import TransferDestinationView from './transfer-destination-view'
import TransferValidationView from './transfer-validation-view'
import TransferSettings from './transfer-settings'
import FeeView from '../shared/fee-view'
import {estimateFee} from '../../../util/fee-estimator'
import {persistAccountInBrowser} from '../../../storage/account-storage'
import accountManager from '../../../state/account-manager'
import {FederationServer} from 'stellar-sdk';

const tabOptions = [
    {name: 'direct', title: 'Direct', isDefault: true},
    {name: 'convert', title: 'Convert'},
    {name: 'claimable', title: 'Claimable'}
]

const transferModeDescription = {
    direct: 'send funds to',
    convert: 'convert and send funds to',
    claimable: 'create pending payment for'
}

function TransferView() {
    const network = useStellarNetwork()
    const [transfer] = useDependantState(() => new TransferSettings(network), [network, accountLedgerData.address])
    const destinationDirectoryInfo = useDirectory(transfer.destination)
    const disabled = !transfer.isValid || parseFloat(transfer.sourceAmount) <= 0
    const balances = accountLedgerData.balancesWithPriority
    const selfTransfer = transfer.source === transfer.destination
    const destinationInfo = useDestinationAccountLedgerData(!selfTransfer ? transfer.destination : '')
    const destinationName = getAccountPredefinedDisplayName(transfer.destination)
    const [showFee, setShowFree] = useState(false)
    const [actualFee, setActualFee] = useState(100)
    const [newAddress, setNewAddress] = useState(null)
    const {activeAccount} = accountManager

    useEffect(() => estimateFee(network).then(estimatedFee => setActualFee(estimatedFee)), [network])

    useEffect(() => {
        const {fromAsset, destination} = parseQuery()
        if (fromAsset) {
            transfer.setAsset(fromAsset, 0)
        }
        if (destination) {
            transfer.setDestination(destination)
        }
        navigation.updateQuery({fromAsset: undefined, destination: undefined})
        if (transfer.mode === 'convert') {
            transfer.startLedgerStreaming()
        }
        return transfer.stopLedgerStreaming
    }, [network, accountLedgerData.address, transfer.mode])

    function updateMode(tab) {
        transfer.setMode(tab)
    }

    function getAccountPredefinedDisplayName(address) {
        if (!window.predefinedAccountDisplayNames) return undefined
        return window.predefinedAccountDisplayNames[address]
    }

    async function saveNewAddress() {
        const {address, ...predefinedAddress} = newAddress
        predefinedAddress['network'] = network
        predefinedAddress['federation_address'] = await getFederationAddress(transfer.destination)
        predefinedAddress.memo.type = transfer.memo?.type || 'none'
        predefinedAddress.memo.value = transfer.memo?.value || ''
        predefinedAddress.memo.encodeMuxedAddress = transfer.encodeMuxedAddress || false
        activeAccount.addressBook = {...activeAccount.addressBook, [address]: predefinedAddress}
        persistAccountInBrowser(activeAccount)
    }

    async function getFederationAddress(destination) {
        if(destinationInfo?.home_domain) {
            return await FederationServer.createForDomain(destinationInfo?.home_domain, {timeout: 3000})
            .then(async server => {
                const result = await server.resolveAccountId(destination)
                return result.stellar_address || ''
            }).catch(() => '')
        }
    }

    function onFinalize() {
        const reuseDestination = transfer.destination
        //Saving address to addressBook if need it
        newAddress && saveNewAddress()
        transfer.resetOperationAmount()
        transfer.setDestination('')
        transfer.setDestination(reuseDestination)
    }

    return <WalletOperationsWrapperView title="Transfer" action="Transfer" disabled={disabled}
                                        prepareTransaction={() => transfer.prepareTransaction(actualFee)}
                                        onFinalize={onFinalize}>
        <Tabs tabs={tabOptions} onChange={updateMode} selectedTab={transfer.mode} queryParam="mode" right/>
        <WalletPageActionDescription>
            {transferModeDescription[transfer.mode]} another Stellar account
        </WalletPageActionDescription>
        <div className="segment micro-space">
            <div className="params">
                <TransferDestinationView transfer={transfer} onChange={transfer.setDestination.bind(transfer)}
                                         federationAddress={transfer.destinationFederationAddress} favorites={setNewAddress}/>
                {(destinationName && destinationInfo && !destinationInfo?.nonExisting) ? 
                    <div className="dimmed condensed text-tiny" style={{paddingTop: '0.2em'}}>
                        [{destinationName}]
                    </div> :
                    <div className="space"/>}
                <TransferAmountView settings={transfer} index={0} balances={balances} restricted placeholder="Amount to send"/>
                {transfer.mode !== 'convert' ?
                    <AvailableAmountLink settings={transfer} index={0}/> :
                    <>
                        <SwapBandView settings={transfer} balances={balances}/>
                        <TransferAmountView settings={transfer} index={1} balances={balances} placeholder="Amount received"/>
                    </>}
            </div>
            {transfer.mode === 'convert' &&
                <SwapSlippageView title="Slippage tolerance" defaultValue={0.5} onChange={v => transfer.setSlippage(v)}/>}
                {(!showFee) ? <div className="space"><a className="text-small dimmed" onClick={() => setShowFree(true)}>Adjust transaction fee</a></div> :
                    <FeeView defaultValue={actualFee * 0.0000001} onChange={v => setActualFee((v / 0.0000001).toFixed(0))}/>
                }
            <TxMemoView transfer={transfer}/>
            {transfer.createDestination && <p className="success text-small micro-space">
                <i className="icon-info"/> The recipient account will be created automatically.{' '}
                <a href="#" onClick={() => runInAction(() => transfer.createDestination = false)}>Cancel</a>{' '}
                account auto-creation?
            </p>}
        </div>
        {transfer.mode === 'claimable' && <p className="segment dimmed text-tiny micro-space">
            Please note: the recipient will have to create a trustline and explicitly claim your payment.
            Creating a claimable balance will temporary lock 0.5 XLM on your account, but you will be able to
            reclaim all transferred tokens and the reserved amount in case if the recipient won't claim the
            transfer.
        </p>}
        <TransferValidationView transfer={transfer} directoryInfo={destinationDirectoryInfo}/>
    </WalletOperationsWrapperView>
}

export default observer(TransferView)