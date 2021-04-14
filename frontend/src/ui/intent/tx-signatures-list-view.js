import React from 'react'
import {observer} from 'mobx-react'
import {StrKey} from 'stellar-sdk'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import {formatHint} from '../../util/signature-hint-utils'
import AccountAddress from '../components/account-address'

function TxSignaturesListView() {
    const {txContext} = actionContext
    //available only for transaction-based intents
    if (!txContext) return null
    const {signatures, signatureSchema} = txContext
    //loading signatures schema
    if (!signatureSchema) return <span className="loader small"/>
    //tx hasn't been signed yet
    if (!signatures || !signatures.length) return <span className="dimmed">No signatures yet</span>

    return <div className="block-indent text-small">
        {signatures.map(s => {
            const displayName = accountManager.get(s.pubKey)?.displayName || s.pubKey || formatHint(s.hint())

            return <div key={s.signature().toString('base64')}>
                <i className="fa fa-edit"/>&nbsp;
                {StrKey.isValidEd25519PublicKey(displayName) ?
                    <AccountAddress account={displayName}/> : displayName}&nbsp;
                {!!s.new && <a href="#" className="fa fa-close" onClick={e => txContext.removeSignatureByHint(hint)}
                               title="Remove signature"/>}
            </div>
        })}
    </div>
}

export default observer(TxSignaturesListView)