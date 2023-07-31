import React, {useCallback, useState} from 'react'
import {Dropdown, useAutoFocusRef} from '@stellar-expert/ui-framework'
import {StrKey} from 'stellar-sdk'
import {getPlaceholder, memoTypes} from '../../wallet/tx/tx-memo-view'
import {useDestinationAccountLedgerData} from '../../../state/ledger-data/account-ledger-data'
import {resolveFederationAddress} from '../../../util/federation-address-resolver'

export default function AccountAddressBookForm({addressSettings, setAddressSettings}) {
    const [memo, setMemo] = useState(addressSettings?.memo)
    const destinationInfo = useDestinationAccountLedgerData(addressSettings?.address || '')

    const setNewValue = useCallback((value, key) => {
        setAddressSettings({...addressSettings, [key]: value})
    }, [addressSettings, setAddressSettings])

    const setMemoType = useCallback((type) => {
        setMemo({...memo, type})
        setNewValue({...memo, type}, 'memo')
    }, [setNewValue, memo])

    const setMemoValue = useCallback((e) => {
        setMemo({...memo, value: e.target.value})
        setNewValue({...memo, value: e.target.value}, 'memo')
    }, [setNewValue, memo])

    const setNewAddress = useCallback(async (e) => {
        const address = e.target.value.trim()
        if (!StrKey.isValidEd25519PublicKey(address) && !StrKey.isValidMed25519PublicKey(address))
            return false

        let newAddressSetting = {
            ...addressSettings,
            address
        }
        const federationAddress = await resolveFederationAddress(destinationInfo)
        //if federation address defined, name is adding automatically
        if (federationAddress) {
            newAddressSetting = {
                ...newAddressSetting,
                name: addressSettings.name !== '' ? addressSettings.name : federationAddress.split('*')[0],
                federation_address: federationAddress
            }
        }
        setAddressSettings(newAddressSetting)
    }, [destinationInfo, addressSettings, setAddressSettings])

    const setNewName = useCallback((e) => {
        setNewValue(e.target.value, 'name')
    }, [setNewValue])

    return <>
        {!addressSettings?.editMode && <div className="space">
            <input type="text" placeholder="Public key"
                   className='condensed'
                   defaultValue={addressSettings?.address || ''}
                   onChange={setNewAddress}/>
        </div>}
        <div className="space">
            <input type="text" placeholder="Name"
                   value={addressSettings?.name || ''}
                   onChange={setNewName}/>
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
