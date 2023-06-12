import React, {useEffect, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {StrKey, FederationServer} from 'stellar-sdk'
import {useDependantState} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {debounce} from 'throttle-debounce'
import accountManager from '../../../state/account-manager'
import {setMemo} from '../../wallet/tx/tx-memo-view'
import {addressBlank} from '../../account/address-book/account-address-book-view'
import TransferDestinationView from '../../wallet/transfer/transfer-destination-view'
import './dropdown-address-book-view.scss'

export default observer(function DropdownAddressBookView({transfer, destinationName}) {
    const {activeAccount} = accountManager
    const addresses = Object.keys(activeAccount.addressBook || {})
    const [searchList, setSearchList] = useState(addresses)
    const [destination, setDestination] = useState(transfer.destination)
    const [proposal, setProposal] = useState(false)
    const [name, setName] = useState('')
    const addressListWrap = useRef()
    const addressListBlock = useRef()
    const inputName = useRef()


    function searchAddress(v) {
        const addressesFiltered = addresses.filter(address => address.toLowerCase().includes(v.toLowerCase()))
        for (const [address, info] of Object.entries(activeAccount.addressBook)) {
            info.name.toLowerCase().includes(v.toLowerCase()) && addressesFiltered.push(address)
        }
        for (const [address, info] of Object.entries(activeAccount.addressBook)) {
            info.federation_address.toLowerCase().includes(v.toLowerCase()) && addressesFiltered.push(address)
        }
        setSearchList([...new Set(addressesFiltered)])
    }

    function chooseAddress(address) {
        //setValue(address)
        setMemo(transfer, activeAccount.addressBook[address].memo.type, activeAccount.addressBook[address].memo.value)
        runInAction(() => {
            transfer.encodeMuxedAddress = activeAccount.addressBook[address].memo.encodeMuxedAddress
        })
        close()
    }

    function onKeyDown(e) {
        if ([13,27].includes(e.keyCode)) close()
    }

    function saveName(e) {
        debounce(300, setName(e.target.value))
    }

    function focus() {
        addressListBlock.current.classList.add("active")
    }

    function close() {
        // proposal === 'addName' && favorites(prevState => {
        //     const newAddress = (prevState) ? {...prevState} : addressBlank
        //     newAddress.name = name
        //     newAddress.address = destination
        //     return newAddress
        // })
        addressListBlock.current.classList.remove("active")
    }

    function handleClickOutside(event)  {
        if (addressListWrap.current && !addressListWrap.current.contains(event.target)) close()
    }

    useEffect(() => {
        destinationName && setName(destinationName)

        proposal === 'addName' && setTimeout(() => {
            const input = inputName.current
            input && input.focus()
        }, 200)

        document.addEventListener('click', handleClickOutside, true)
        return () => {
            document.removeEventListener('click', handleClickOutside, true)
        }
    }, [proposal])

    return <div ref={addressListWrap} className={'address-list-wrap'}>
        <TransferDestinationView address={destination} federationAddress={transfer.destinationFederationAddress}
                                 onChange={transfer.setDestination.bind(transfer)}/>
        <div ref={addressListBlock} className="address-list-block">
            {!!addresses.length && searchList.map(address => {
                return <a key={address} onClick={() => chooseAddress(address)}>
                    {activeAccount.addressBook[address].name ? `[${activeAccount.addressBook[address].name}]` : `[Address]`}&nbsp;
                    {shortenString(address, 8)}&nbsp;
                    <span className="dimmed text-small">Network: {activeAccount.addressBook[address].network}</span>
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
                <input ref={inputName} type="text" defaultValue={name} onChange={saveName} onKeyDown={onKeyDown} placeholder="Name"/>
                <div className="dimmed condensed text-tiny text-right" style={{paddingTop: '0.2em'}}>The name will be saved automatically</div>
            </div>}
        </div>
    </div>
})