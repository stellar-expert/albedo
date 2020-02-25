import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import {formatHint, findKeyByHint} from '../../util/signature-hint-utils'

function TxSignaturesListView() {
    const {txContext} = actionContext
    //available only for transaction-based intents
    if (!txContext) return null
    const {signatures, signatureSchema} = txContext
    //loading signatures schema
    if (!signatureSchema) return <span className="loader small"/>
    //the tx has'n been signed yet
    if (!signatures || !signatures.length) return <span className="dimmed">No signatures yet</span>
    //show signatures
    const {activeAccount} = accountManager
    return <div className="block-indent">
        {signatures.map(s => {
            const hint = s.hint(),
                key = findKeyByHint(hint, activeAccount.keypairs.map(k => k.publicKey)),
                keypair = key && activeAccount.keypairs.find(k => k.publicKey === key)
            //TODO: do not allow to delete pre-existing signatures
            return <div key={formatHint(hint)}>
                <i className="fa fa-edit"/>&nbsp;
                {keypair ? keypair.displayName : formatHint(hint)}&nbsp;
                {!!s.new && <a href="#" className="fa fa-close" onClick={e => txContext.removeSignatureByHint(hint)}
                               title="Remove signature"/>}
            </div>
        })}
    </div>
}

export default observer(TxSignaturesListView)