import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {Dropdown, InfoTooltip, useDependantState, useDirectory} from '@stellar-expert/ui-framework'
import accountLedgerData, {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import {useStellarNetwork} from '../../../state/network-selector'
import TransferSettings from './transfer-settings'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferDestinationView from './transfer-destination-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../swap/swap-slippage-view'
import SwapBandView from '../swap/swap-band-view'
import TransferValidationView from './transfer-validation-view'
import TransferMemoView from './transfer-memo-view'

const TransferTitleView = observer(function TransferTitleView({transfer}) {
    const options = [
        {title: 'Direct', value: 'direct'},
        {title: 'Convert', value: 'convert'},
        {title: 'Claimable', value: 'claimable'}
    ]

    function onChange(mode) {
        transfer.setMode(mode)
    }

    return <>Transfer | <Dropdown options={options} value={transfer.mode} onChange={onChange}/></>
})

function TransferView() {
    const network = useStellarNetwork(),
        [valid, setValid] = useState(true),
        [transfer] = useDependantState(() => new TransferSettings(network), [network]),
        destinationAccountLedgerData = useDestinationAccountLedgerData(transfer.destination),
        destinationDirectoryInfo = useDirectory(transfer.destination),
        disabled = !destinationAccountLedgerData || !valid || parseFloat(transfer.sourceAmount) <= 0,
        predefinedAssets = accountLedgerData.getBalancesWithPriority().map(t => t.id)
    useEffect(() => {
        if (transfer.mode === 'convert') {
            transfer.startLedgerStreaming()
        }
        return transfer.stopLedgerStreaming
    }, [network, accountLedgerData.address, transfer.mode])

    return <WalletOperationsWrapperView title={<TransferTitleView transfer={transfer}/>} action="Transfer"
                                        disabled={disabled} prepareTransaction={() => transfer.prepareTransaction()}>
        <div className="transfer space">
            <div className="params">
                <TransferDestinationView address={transfer.destination}
                                         onChange={transfer.setDestination.bind(transfer)}
                                         federationAddress={transfer.destinationFederationAddress}/>
                <div className="space"/>
                <TransferAmountView settings={transfer} prefix="source" assets={predefinedAssets} restricted
                                    placeholder="Amount to send"/>
                <SwapBandView settings={transfer}/>
                {transfer.mode === 'convert' &&
                <TransferAmountView settings={transfer} prefix="dest" assets={predefinedAssets}
                                    placeholder="Amount received"/>}
            </div>
            {transfer.mode === 'convert' && <SwapSlippageView onChange={v => transfer.setSlippage(v)}/>}
            <TransferMemoView transfer={transfer}/>
            {transfer.createDestination && <p className="success text-small micro-space">
                <i className="icon-info"/> The recipient account will be created automatically.{' '}
                <a href="#" onClick={() => runInAction(() => transfer.createDestination = false)}>Cancel</a>{' '}
                account auto-creation?
            </p>}
            {transfer.mode === 'claimable' && <p className="dimmed text-small micro-space">
                Please note: the recipient will have to create a trustline and explicitly claim your payment.
                Creating a claimable balance will temporary lock 0.5 XLM on your account, but you will be able to
                reclaim all transferred tokens and the reserved amount in case if the recipient won't claim the
                transfer.
            </p>}
        </div>
        <TransferValidationView transfer={transfer} destination={destinationAccountLedgerData}
                                directoryInfo={destinationDirectoryInfo} onValidate={setValid}/>
    </WalletOperationsWrapperView>
}

export default observer(TransferView)