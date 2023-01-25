import React from 'react'
import TxFeeEffect from './tx-fee-effect'
import {OpDescriptionView} from './op-description-view'
import {OpIcon} from './op-icon'
import {OpEffectsView} from './op-effects-view'
import {OpAccountingChanges, TxFeeAccountingChanges} from './op-accounting-changes'
import './op-description.scss'

/*
Every operation can be in one of the following states (detected automatically):
- Ephemeral
    - Pending (not processed by StellarCore yet)
    - Rejected (rejected by Horizon or StellarCore during execution)
- Applied
    - Processed (applied to the ledger and resulted in some on-chain state changes)
    - Processed without effects (applied to the ledger but yielded no changes in the ledger state)
- Failed during the execution

Display context
- Transaction context
    - All operations displayed
    - Source account always visible
    - No fee charges
    - Effects displayed
- Unfiltered view context
    - All operations displayed
    - Source account always visible
    - No fee charges
    - All effects displayed
- Filtered view context
    - Only operations related to the filter context (account/asset/order)
    - Source account always visible
    - Fee charges ony for account context
    - Effects related to the filter context
- Account history view context
    - Only operations DIRECTLY related to the current account (skip third-party operations for claimable balances, sponsorship, etc)
    - Source account displayed only when operation (or transaction) source account not matches current account
    - Fee charge effects displayed only if charged from the current account
    - Effects related to the current account
 */

/**
 * @param {ParsedTxDetails} parsedTx
 * @param {Boolean} compact?
 */
export default function TxOperationsList({parsedTx, compact = false}) {
    const showFeeCharges = !compact &&
        parsedTx.contextType === 'account' &&
        (parsedTx.context === parsedTx.tx.source || parsedTx.context === parsedTx.tx.innerTransaction?.source)
    return <div className="condensed">
        {showFeeCharges && parsedTx.txEffects
            .filter(e => !parsedTx.context || e.source === parsedTx.context)
            .map((e, i) => <div className="op-container">
                <div className="op-layout">
                    <OpIcon op="feeCharge"/>
                    <TxFeeEffect key={parsedTx.txHash + i} feeEffect={e} compact={compact}/>
                    {!!compact && !parsedTx.isEphemeral && <TxFeeAccountingChanges amount={e.charged}/>}
                </div>
            </div>)}
        {parsedTx.operations.map(op => <div className="op-container" key={op.txHash + op.order + op.isEphemeral + op.context}>
            <div className="op-layout">
                <OpIcon op={op}/>
                <div>
                    <OpDescriptionView key={parsedTx.txHash + op.order} op={op} compact={compact}/>
                </div>
                {!!compact && !op.isEphemeral && <OpAccountingChanges op={op}/>}
            </div>
            <OpEffectsView effects={op.effects}/>
        </div>)}
    </div>
}
