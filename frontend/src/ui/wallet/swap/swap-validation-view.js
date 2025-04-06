import React from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {AssetLink, useStellarNetwork} from '@stellar-expert/ui-framework'
import {createTestnetAccount} from '../../../util/horizon-connector'
import {prepareAddTrustlineTx} from '../trustline/add-trustline-tx-builder'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'

async function requestTrustlineCreation(swap, asset, network) {
    await confirm(<div className="text-small">
        This action will temporarily lock 0.5 XLM on your account balance (can be reclaimed later).
        Would you like to add this asset?
    </div>, {title: <>Create trustline for <AssetLink asset={asset}/></>})
    const tx = await prepareAddTrustlineTx(asset, network)
    if (!tx)
        return
    await confirmTransaction(network, tx)
    runInAction(() => swap.createTrustline = true)
    notify({type: 'success', message: 'Trustline created'})
}

function SwapValidationView({swap}) {
    const network = useStellarNetwork()
    switch (swap.validationStatus) {
        case 'missing_parameters':
            return null
        case 'missing_account':
            return <ValidationWrapper>
                The account does not exist on the ledger.
                <br/>
                {network === 'testnet' &&
                    <a href="#" onClick={createTestnetAccount}>Create a <b>testnet</b> account automatically?</a>}
            </ValidationWrapper>
        case 'insufficient_balance':
            return <ValidationWrapper>
                Insufficient balance on your account. Please adjust the amount of tokens to swap.
            </ValidationWrapper>
        case 'trustline_missing':
            const assetCode = swap.asset[1].split('-')[0]
            return <>
                You need to establish a trustline to {assetCode} before trading with it.
                Would you like to <a href="#" onClick={() => requestTrustlineCreation(swap, swap.asset[1], network)}>create the
                trustline</a>?
                This action will temporarily lock 0.5 XLM on your account balance.
            </>
        default:
            if (swap.validationStatus) {
                console.warn('Unknown swap validation status: ' + swap.validationStatus)
            }
            return null
    }
}

function ValidationWrapper({children}) {
    return <div className="segment segment-inline warning segment text-small space">
        <i className="icon-warning"/> {children}
    </div>
}

export default observer(SwapValidationView)