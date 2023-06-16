import React from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

function AccountAddressListView({addressBook, addEditAddress, removeAddress}) {
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
                        <a onClick={() => addEditAddress(address)} title='Edit address'><i className="icon-cog"/></a>
                        <a onClick={() => removeAddress(address)} title='Remove address'><i className="icon-delete-circle"/></a>
                    </div>
                </div>
                <p className="text-small dimmed" style={{textAlign: "initial"}}>
                    {addressProps.memo?.type !== 'none' && addressProps.memo?.value && <span>Memo: {addressProps.memo.value}&emsp;</span>}
                    {addressProps?.federation_address && <span>Federation address: {addressProps.federation_address}</span>}
                </p>
                <hr/>
            </div>
        })}
    </>
}

export default AccountAddressListView
