import React, {useCallback} from 'react'
import {CopyToClipboard, Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

const actionOptions = [
    {value: 'change', title: 'Change'},
    {value: 'remove', title: 'Remove'}
]

export default function AccountAddressView({addressSettings, editAddress, removeAddress}) {
    const [address, addressProps] = addressSettings

    const handleActions = useCallback(action => {
        if (action === 'change') {
            editAddress(address)
        } else {
            removeAddress(address)
        }
    }, [address, editAddress, removeAddress])

    return <div className="space">
        <div className="dual-layout">
            <span className="account-address">
                [{addressProps.name || 'Address'}]&nbsp;
                <span className="account-key">{shortenString(address, 8)}</span>
                <CopyToClipboard text={address} title="Copy public key to clipboard"/>
            </span>
            <div>
                <Dropdown title={<span style={{fontSize: '1.8rem'}}><i className="icon-cog"/></span>} showToggle={false} hideSelected
                          options={actionOptions} onChange={handleActions}/>
            </div>
        </div>
        <p className="text-small dimmed" style={{textAlign: "initial"}}>
            {addressProps?.federation_address && <span>{addressProps.federation_address}&emsp;</span>}
            {addressProps.memo?.type !== 'none' && addressProps.memo?.value && <span>Memo: {addressProps.memo.value}</span>}
        </p>
        <hr/>
    </div>
}