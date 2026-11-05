import React from 'react'
import {observer} from 'mobx-react'
import {StrKey} from '@stellar/stellar-sdk'
import {AccountAddress, formatSignatureHint} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import {encodeBase64} from '../../../util/crypto/base64'

function TxSignaturesListView({txContext}) {
    //available only for transaction-based intents
    if (!txContext) return null
    const {signatures, signatureSchema} = txContext
    //loading signatures schema
    if (!signatureSchema) return <span className="loader small"/>
    //tx hasn't been signed yet
    if (!signatures || !signatures.length) return <span className="dimmed">No signatures yet</span>

    return <div className="block-indent text-small">
        {signatures.map(s => {
            const displayName = accountManager.get(s.pubKey)?.displayName || s.pubKey || formatSignatureHint(s.hint)

            return <div key={encodeBase64(s.signature.toBytes())}>
                <i className="icon-feather"/>&nbsp;
                {StrKey.isValidEd25519PublicKey(displayName) ?
                    <AccountAddress account={displayName}/> : displayName}&nbsp;
                {!!s.new && <a href="#" className="icon-cancel" onClick={e => txContext.removeSignatureByHint(s.hint.toBytes())}
                               title="Remove signature"/>}
            </div>
        })}
    </div>
}

export default observer(TxSignaturesListView)
