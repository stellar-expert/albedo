import React, {useState} from 'react'
import {CopyToClipboard, Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

export default function AccountAddressListView({addressBook, addEditAddress, removeAddress}) {
    const [currentAddress, setCurrentAddress] = useState()
    const actionOptions = [
        {value: 'change', title: 'Change'},
        {value: 'remove', title: 'Remove'}
    ]

    function handleActions(action) {
        if (action === 'change') {
            addEditAddress(currentAddress)
        } else {
            removeAddress(currentAddress)
        }
    }

    return <>
        {Object.entries(addressBook).map(([address, addressProps]) => {
            return <div key={address} className="space">
                <div className="dual-layout">
                    <span className="account-address">
                        [{addressProps.name || 'Address'}]&nbsp;
                        <span className="account-key">{shortenString(address, 8)}</span>
                        <CopyToClipboard text={address} title="Copy public key to clipboard"/>
                    </span>
                    <div>
                        <Dropdown title={<span style={{fontSize: '1.8rem'}}><i className="icon-cog"/></span>} showToggle={false} hideSelected
                                  options={actionOptions} onChange={handleActions} onOpen={() => setCurrentAddress(address)}/>
                    </div>
                </div>
                <p className="text-small dimmed" style={{textAlign: "initial"}}>
                    {addressProps?.federation_address && <span>{addressProps.federation_address}&emsp;</span>}
                    {addressProps.memo?.type !== 'none' && addressProps.memo?.value && <span>Memo: {addressProps.memo.value}</span>}
                </p>
                <hr/>
            </div>
        })}
    </>
}
