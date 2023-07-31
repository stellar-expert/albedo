import React, {useEffect, useState} from 'react'
import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import {Tabs, useDependantState, useDirectory, useStellarNetwork} from '@stellar-expert/ui-framework'
import {parseQuery, navigation} from '@stellar-expert/navigation'
import accountLedgerData, {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import SwapSlippageView from '../shared/slippage-view'
import TransferAmountView from '../shared/transfer-amount-view'
import AvailableAmountLink from '../shared/available-amount-link-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import TxMemoView from '../tx/tx-memo-view'
import SwapBandView from '../swap/swap-band-view'
import FeeView from '../shared/fee-view'
import TransferSettings from './transfer-settings'
import TransferValidationView from './transfer-validation-view'
import TransferDestinationView from './transfer-destination-view'
import DestinationHintsView from './destination-hints-view'
import TransferDestinationTitleView from './transfer-destination-title-view'

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

    useEffect(() => {
        const {fromAsset, destination} = parseQuery()
        if (fromAsset) {
            transfer.setAsset(fromAsset, 0)
        }
        if (destination) {
            transfer.setDestination(destination)
            transfer.setDestinationInputValue(destination)
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

    function onFinalize() {
        transfer.resetOperationAmount()
    }

    return <WalletOperationsWrapperView title="Transfer" action="Transfer" disabled={disabled}
                                        transfer={transfer}
                                        prepareTransaction={() => transfer.prepareTransaction()}
                                        onFinalize={onFinalize}>
        <Tabs tabs={tabOptions} onChange={updateMode} selectedTab={transfer.mode} queryParam="mode" right/>
        <WalletPageActionDescription>
            {transferModeDescription[transfer.mode]} another Stellar account
        </WalletPageActionDescription>
        <div className="segment micro-space">
            <div className="params relative">
                <TransferDestinationTitleView transfer={transfer}/>
                <TransferDestinationView transfer={transfer}/>
                <DestinationHintsView transfer={transfer}/>
                <div className="space"/>
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
            <FeeView transfer={transfer}/>
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