import React from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter';

function AccountAddressList({addressBook, addEditAddress, removeAddress}) {
    return <>
        {Object.keys(addressBook).map(address => {
            return <div key={address} className='space'>
                <div className="dual-layout">
                    <span className='account-address'>
                        [{addressBook[address].name || 'Address'}]&nbsp;
                        <span className="account-key">{shortenString(address, 8)}</span>
                        <CopyToClipboard text={address} title="Copy public key to clipboard"/>
                    </span>
                    <div>
                        <a onClick={() => addEditAddress(address)} title='Edit address'><i className="icon-cog"/></a>
                        <a onClick={() => removeAddress(address)} title='Remove address'><i className="icon-delete-circle"/></a>
                    </div>
                </div>
                <p className="text-small dimmed" style={{textAlign: "initial"}}>
                    Network: {addressBook[address].network}&emsp;
                    {addressBook[address].memo?.value && <span>Memo: {addressBook[address].memo.value}</span>}&emsp;
                    {addressBook[address]?.federation_address && <span>Federation address: {addressBook[address].federation_address}</span>}
                </p>
                <hr/>
            </div>
        })}
    </>
}

export default AccountAddressList
