import React, { useState } from 'react'
import { getPlaceholder, memoTypes } from './../../wallet/tx/tx-memo-view';
import { Dropdown, useAutoFocusRef } from '@stellar-expert/ui-framework';

function AccountAddressBookForm({addressSettings, setAddressSettings}) {
    const [memo, setMemo] = useState(addressSettings?.memo)
    
    const networkOptions = [
        {value: 'public', title: 'public network'},
        {value: 'testnet', title: 'test network'}
    ]

    function changeMemo(newMemo) {
        const newAddressSettings = {
            ...addressSettings,
            memo: {...newMemo}
        }
        setMemo(newMemo)
        setAddressSettings(newAddressSettings)
    }

    function setNewMemo(value, key) {
        const newMemo = {
            ...memo,
            [key]: value
        }
        changeMemo(newMemo)
    }

    function setNewValue(value, key) {
        setAddressSettings({...addressSettings, [key]: value})
    }

    return <>
        {!addressSettings?.editMode && <div className="space">
            <input type="text" placeholder="Public key"
                value={addressSettings?.address || ''} 
                onChange={e => setNewValue(e.target.value.trim(), 'address')}/>
        </div>}
        <div className="space">
            <input type="text" placeholder="Name"
                value={addressSettings?.name || ''} 
                onChange={e => setNewValue(e.target.value, 'name')}/>
        </div>
        <div className="space">
            <input type="text" placeholder="Federation address"
                value={addressSettings?.federation_address || ''} 
                onChange={e => setNewValue(e.target.value, 'federation_address')}/>
        </div>
        <div className="text-small space">
            Network: <Dropdown options={networkOptions} value={addressSettings?.network || networkOptions[0].value} 
                onChange={network => setNewValue(network, 'network')} />
        </div>
        {memo && <div className="text-small space">
            Transaction memo: <Dropdown options={memoTypes} value={memo.type} onChange={val => setNewMemo(val, 'type')}/> (optional)
            {memo.type !== 'none' && <div className="micro-space">
                <input type="text" value={memo.value} 
                    onChange={e => setNewMemo(e.target.value, 'value')} 
                    placeholder={getPlaceholder(memo.type)} 
                    ref={useAutoFocusRef}/>
            </div>}
            {memo.type === 'id' && <label className="micro-space text-tiny">
                <input type="checkbox" defaultChecked={!!memo?.encodeMuxedAddress} 
                    onChange={e => setNewMemo(!!e.target.value, 'encodeMuxedAddress')}/>{' '}
                Encode as multiplexed address <span className="dimmed">(starting with M...)</span>
            </label>}
        </div>}
    </>
}

export default AccountAddressBookForm
