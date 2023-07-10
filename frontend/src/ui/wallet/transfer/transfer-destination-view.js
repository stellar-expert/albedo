import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {debounce} from 'throttle-debounce'
import {StrKey} from 'stellar-sdk'
import {resolveFederationAccount} from '../../../util/federation-address-resolver'

const checkFederationAddress = debounce(500, resolveFederationAccount)

export default observer(function TransferDestinationView({transfer}) {
    const textChange = useCallback(function (e) {
        const v = e.target.value.trim()
        transfer.setDestinationInputValue(v)
        if (StrKey.isValidEd25519PublicKey(v) || StrKey.isValidMed25519PublicKey(v)) {
            transfer.setDestination(v)
            return
        }
        if (/^.+\*\w+\.[\w.]+$/.test(v)) {
            checkFederationAddress(v, resolved => {
                if (resolved && resolved.account_id) {
                    transfer.setDestination(resolved.account_id, {link: v, ...resolved})
                } else {
                    transfer.setDestination(null, {link: v})
                }
            })
        }
        transfer.setDestination(null)
    }, [transfer])

    return <input type="text" value={transfer.destinationInputValue || ''} onChange={textChange} className="key destination"
                  placeholder="Recipient address or federation link"/>
})