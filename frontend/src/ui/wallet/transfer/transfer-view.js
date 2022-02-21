import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {Dropdown, useDependantState, useDirectory, useStellarNetwork} from '@stellar-expert/ui-framework'
import accountLedgerData, {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import TransferSettings from './transfer-settings'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import TransferDestinationView from './transfer-destination-view'
import TransferAmountView from '../shared/transfer-amount-view'
import SwapSlippageView from '../shared/slippage-view'
import TransferValidationView from './transfer-validation-view'
import TransferMemoView from './transfer-memo-view'
import AvailableAmountLink from '../shared/available-amount-link-view'
import SwapBandView from '../swap/swap-band-view'

const TransferTitleView = observer(function TransferTitleView({transfer}) {
    const options = [
        {title: 'direct', value: 'direct'},
        {title: 'convert', value: 'convert'},
        {title: 'claimable', value: 'claimable'}
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
        balances = accountLedgerData.balancesWithPriority
    useEffect(() => {
        if (transfer.mode === 'convert') {
            transfer.startLedgerStreaming()
        }
        return transfer.stopLedgerStreaming
    }, [network, accountLedgerData.address, transfer.mode])

    return <WalletOperationsWrapperView title={<TransferTitleView transfer={transfer}/>} action="Transfer"
                                        disabled={disabled} prepareTransaction={() => transfer.prepareTransaction()}
                                        onFinalize={() => transfer.resetOperationAmount()}>
        <div className="transfer space">
            <div className="params">
                <TransferDestinationView address={transfer.destination}
                                         onChange={transfer.setDestination.bind(transfer)}
                                         federationAddress={transfer.destinationFederationAddress}/>
                <div className="space"/>
                <TransferAmountView settings={transfer} index={0} balances={balances} restricted
                                    placeholder="Amount to send"/>
                {transfer.mode !== 'convert' ?
                    <AvailableAmountLink settings={transfer} index={0}/> :
                    <>
                        <SwapBandView settings={transfer}/>
                        <TransferAmountView settings={transfer} index={1} balances={balances}
                                            placeholder="Amount received"/>
                    </>}
            </div>
            {transfer.mode === 'convert' &&
            <SwapSlippageView title="Slippage tolerance" defaultValue={0.5} onChange={v => transfer.setSlippage(v)}/>}
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