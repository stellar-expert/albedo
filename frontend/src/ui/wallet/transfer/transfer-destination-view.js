import React from 'react'
import {StrKey, FederationServer} from 'stellar-sdk'
import {debounce} from 'throttle-debounce'
import {useDependantState} from '@stellar-expert/ui-framework'

const checkFederationAddress = debounce(500, function (fed, callback) {
    FederationServer.resolve(fed, {timeout: 10000})
        .then(res => callback(res || null))
        .catch(e => callback(null))//ignore resolution errors
})

export default function TransferDestinationView({address, federationAddress, onChange}) {
    const [value, setValue] = useDependantState((_, prev) => federationAddress || address || prev || '', [address])

    function change(e) {
        const v = e.target.value.trim()
        setValue(v)
        if (StrKey.isValidEd25519PublicKey(v)) {
            onChange(v)
            return
        }
        if (/^.+\*\w+\.[\w\.]+$/.test(v)) {
            checkFederationAddress(v, resolved => {
                if (resolved && resolved.account_id) {
                    onChange(resolved.account_id, {link: v, ...resolved})
                } else {
                    onChange(null, {link: v})
                }
            })
        }
        onChange(null)
    }

    return <div>
        <input type="text" value={value} onChange={change} placeholder="Recipient address or federation link"
               data-lpignore="true"/>
    </div>
}