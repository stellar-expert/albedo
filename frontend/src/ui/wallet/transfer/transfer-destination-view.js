import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {debounce} from 'throttle-debounce'
import {StrKey} from '@stellar/stellar-base'
import {resolveFederationAccount} from '../../../util/federation-address-resolver'
import {resolveSorobandomainsAccount} from '../../../util/sorobandomains-address-resolver'

const checkFederationAddress = debounce(500, resolveFederationAccount)
const checkSorobandomainsAddress= debounce(500, resolveSorobandomainsAccount)

export default observer(function TransferDestinationView({transfer}) {
    const textChange = useCallback(function (e) {
        const v = e.target.value.trim()
        transfer.setDestinationInputValue(v)
        if (StrKey.isValidEd25519PublicKey(v) || StrKey.isValidMed25519PublicKey(v)) {
            transfer.setDestination(v)
            return
        }
        if (/^([a-z0-9-+]+)\.xlm$/i.test(v)) {
            checkSorobandomainsAddress(v, resolved => {
                if (resolved) {
                    transfer.setDestination(resolved, {link: v, account_id: resolved})
                } else {
                    transfer.setDestination(null, {link: v})
                }
            })
        } else if (/^.+\*\w+\.[\w.]+$/.test(v)) {
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