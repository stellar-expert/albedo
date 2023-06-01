import React, {useEffect, useRef, useState} from 'react'
import {StrKey, FederationServer} from 'stellar-sdk'
import {debounce} from 'throttle-debounce'
import {useDependantState} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import {shortenString} from '@stellar-expert/formatter'
import './transfer-destination.scss'
import {setMemo} from './../tx/tx-memo-view'
import { observer } from 'mobx-react'
import { addressBlank } from '../../account/addressBook/account-addressbook-view'
import { runInAction } from 'mobx'

const checkFederationAddress = debounce(500, function (fed, callback) {
    FederationServer.resolve(fed, {timeout: 10000})
        .then(res => callback(res || null))
        .catch(e => callback(null))//ignore resolution errors
})

export default observer(function TransferDestinationView({transfer, federationAddress, onChange, favorites}) {
    const [value, setValue] = useDependantState((_, prev) => federationAddress || transfer.destination || prev || '', [transfer.destination])
    const {activeAccount} = accountManager
    const addresses = Object.keys(activeAccount.addressBook || {})
    const [searchList, setSearchList] = useState(addresses)
    const [proposal, setProposal] = useState(false)
    const [name, setName] = useState('')
    const addressListBlock = useRef()
    const addressListWrap = useRef(null)

    function change(e) {
        const v = e.target.value.trim()
        setValue(v)
        favorites && searchAddress(v)
        if (StrKey.isValidEd25519PublicKey(v) || StrKey.isValidMed25519PublicKey(v)) {
            setProposal(v)
            onChange(v)
            return
        }
        if (/^.+\*\w+\.[\w\.]+$/.test(v)) {
            checkFederationAddress(v, resolved => {
                if (resolved && resolved.account_id) {
                    setProposal(resolved.account_id)
                    onChange(resolved.account_id, {link: v, ...resolved})
                } else {
                    onChange(null, {link: v})
                }
            })
        }
        setProposal(false)
        onChange(null)
    }

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
        setValue(address)
        setMemo(transfer, activeAccount.addressBook[address].memo.type, activeAccount.addressBook[address].memo.value)
        runInAction(() => {
            transfer.encodeMuxedAddress = activeAccount.addressBook[address].memo.encodeMuxedAddress
        })
        close()
    }

    function saveName(name) {
        setName(name)
    }

    function focus() {
        addressListBlock.current.classList.add("active")
    }

    function close() {
        proposal === 'addName' && favorites(prevState => {
            const newAddress = (prevState) ? {...prevState} : addressBlank
            newAddress['name'] = name
            newAddress['address'] = value
            return newAddress
        })
        addressListBlock.current.classList.remove("active")
    }

    function handleClickOutside(event)  {
        if (addressListWrap.current && !addressListWrap.current.contains(event.target)) close()
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [name, proposal]);

    return <div ref={addressListWrap} className={favorites && 'address-list-wrap'}>
        <input type="text" value={value} className="destination-input"
            onChange={change} onFocus={focus}
            placeholder="Recipient address or federation link"/>
        {!!favorites && <>
            <div ref={addressListBlock} className="address-list-block">
                {!!addresses.length && searchList.map(address => {
                    return <a key={address} onClick={() => chooseAddress(address)}>
                        {!!activeAccount.addressBook[address].name ? `[${activeAccount.addressBook[address].name}]` : `[Address]`}&nbsp;
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
                {proposal === 'addName' && <div className='add-name-address'>
                    <input type="text" value={name} onChange={e => saveName(e.target.value)} placeholder="Name"/>
                    <div className='dimmed condensed text-tiny text-right' style={{paddingTop: '0.2em'}}>The name will be saved automatically</div>
                </div>}
            </div>
        </>}
    </div>
})