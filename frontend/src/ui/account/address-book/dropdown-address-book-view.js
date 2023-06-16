import React, {useEffect, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {Button} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import accountManager from '../../../state/account-manager'
import {setMemo} from '../../wallet/tx/tx-memo-view'
import {persistAccountInBrowser} from '../../../storage/account-storage'
import TransferDestinationView from '../../wallet/transfer/transfer-destination-view'
import {getFederationAddress} from '../../../util/get-federation-address'
import './dropdown-address-book-view.scss'

export default observer(function DropdownAddressBookView({transfer, destinationName, destinationInfo}) {
    const {activeAccount} = accountManager
    const addresses = Object.keys(activeAccount.addressBook || {})
    const [searchList, setSearchList] = useState(addresses)
    const [proposal, setProposal] = useState(null)
    const [name, setName] = useState('')
    const addressListWrap = useRef()
    const addressListBlock = useRef()
    const inputName = useRef()

    function onChange(address) {
        transfer.setDestination(address)
        setProposal(address)
    }

    function searchAddress(v) {
        const addressesFiltered = addresses.filter(address => address.toLowerCase().includes(v.toLowerCase()))
        for (const [address, info] of Object.entries(activeAccount.addressBook)) {
            if (info.name.toLowerCase().includes(v.toLowerCase())) addressesFiltered.push(address)
        }
        for (const [address, info] of Object.entries(activeAccount.addressBook)) {
            if (info.federation_address?.toLowerCase().includes(v.toLowerCase())) addressesFiltered.push(address)
        }
        setSearchList([...new Set(addressesFiltered)])
    }

    function chooseAddress(address) {
        transfer.setDestination(address)
        searchAddress(address)
        setMemo(transfer, activeAccount.addressBook[address].memo?.type || 'none', activeAccount.addressBook[address].memo?.value || '')
        runInAction(() => {
            transfer.encodeMuxedAddress = activeAccount.addressBook[address].memo?.encodeMuxedAddress || false
        })
        close()
    }

    function onKeyDown(e) {
        if (e.keyCode === 13) saveName()
    }

    async function saveName() {
        const federationAddress = await getFederationAddress(destinationInfo)
        const newAddress = {name}
        if (federationAddress) newAddress.federation_address = federationAddress
        activeAccount.addressBook = {...activeAccount.addressBook, [transfer.destination]: newAddress}
        addresses.push(transfer.destination)
        searchAddress(transfer.destination)
        persistAccountInBrowser(activeAccount)
        setProposal(null)
        close()
    }

    function focus() {
        addressListBlock.current.classList.add("active")
    }

    function close() {
        addressListBlock.current.classList.remove("active")
    }

    function handleClickOutside(event)  {
        if (addressListWrap.current && !addressListWrap.current.contains(event.target)) close()
    }

    useEffect(() => {
        if (destinationName) setName(destinationName)

        if (proposal === 'addName') setTimeout(() => {
            inputName.current?.focus()
        }, 200)

        document.addEventListener('mousedown', handleClickOutside, true)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true)
        }
    }, [proposal])

    return <div ref={addressListWrap} className="address-list-wrap">
        <TransferDestinationView address={transfer.destination} federationAddress={transfer.destinationFederationAddress}
                                 onChange={onChange} searchAddress={searchAddress} focus={focus}/>
        <div ref={addressListBlock} className="address-list-block">
            {!!addresses.length && searchList.map(address => {
                return <a key={address} onClick={() => chooseAddress(address)}>
                    {activeAccount.addressBook[address]?.name ? `[${activeAccount.addressBook[address].name}]` : `[Address]`}&nbsp;
                    {shortenString(address, 8)}
                </a>
            })}
            {!proposal && !searchList.length && <div className="dimmed text-center" style={{padding: '.4em .6em'}}>
                Not found in Address book</div>}
            {proposal && proposal !== 'addName' && !searchList.length && <a 
                className="add-address dimmed text-center" 
                onClick={() => setProposal('addName')}>
                Add this address to your Address Book?
            </a>}
            {proposal === 'addName' && <div className="add-name-address">
                <input ref={inputName} type="text" defaultValue={name} onChange={e => setName(e.target.value)} onKeyDown={onKeyDown} placeholder="Name"/>
                <div className="space">
                    <Button block disabled={name === ''} onClick={saveName}>Save</Button>
                </div>
            </div>}
        </div>
    </div>
})