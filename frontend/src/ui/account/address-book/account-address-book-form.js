import React, {useCallback, useEffect, useState} from 'react'
import {Dropdown, useAutoFocusRef} from '@stellar-expert/ui-framework'
import {getPlaceholder, memoTypes} from '../../wallet/tx/tx-memo-view'
import {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import {getFederationAddress} from '../../../util/get-federation-address'

function AccountAddressBookForm({addressSettings, setAddressSettings}) {
    const [memo, setMemo] = useState(addressSettings?.memo)
    const destinationInfo = useDestinationAccountLedgerData(addressSettings?.address || '')

    useEffect(() => {
        if (destinationInfo) checkAddress()
    }, [destinationInfo])

    const setMemoType = useCallback((type) => {
        setMemo({...memo, type})
        setNewValue({...memo, type}, 'memo')
    }, [addressSettings])

    const setMemoValue = useCallback((e) => {
        setMemo({...memo, value: e.target.value})
        setNewValue({...memo, value: e.target.value}, 'memo')
    }, [addressSettings])

    const setNewValue = useCallback((value, key) => {
        setAddressSettings({...addressSettings, [key]: value})
    }, [addressSettings])

    const checkAddress = useCallback(async () => {
        const federationAddress = await getFederationAddress(destinationInfo)
        const definedName = addressSettings.name !== '' ? addressSettings.name : federationAddress?.split('*')[0]
        const federationSettings = {
            name: definedName || '',
            federation_address: federationAddress || ''
        }
        setAddressSettings({...addressSettings, ...federationSettings})
    }, [destinationInfo])

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
        {memo && <div className="text-small space">
            Transaction memo: <Dropdown options={memoTypes} value={memo.type} onChange={setMemoType}/> (optional)
            {memo.type !== 'none' && <div className="micro-space">
                <input type="text" value={memo.value} 
                       onChange={setMemoValue} 
                       placeholder={getPlaceholder(memo.type)} 
                       ref={useAutoFocusRef}/>
            </div>}
        </div>}
    </>
}

export default AccountAddressBookForm
