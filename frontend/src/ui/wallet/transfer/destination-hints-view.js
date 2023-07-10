import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {AccountAddress, Button} from '@stellar-expert/ui-framework'
import accountManager from '../../../state/account-manager'
import {persistAccountInBrowser} from '../../../storage/account-storage'
import {setMemo} from '../tx/tx-memo-view'
import './destination-hints.scss'

export default observer(function DestinationHintsView({transfer}) {
    const {destination, destinationInputValue} = transfer
    const {activeAccount} = accountManager
    const [editorVisible, setEditorVisible] = useState(false)
    const [title, setTitle] = useState('')
    const destinationSuggestions = getDestinationSuggestions(destinationInputValue)

    //add to the address book
    const saveName = useCallback(function () {
        const {activeAccount} = accountManager
        const newAddress = {name: title}
        //attach federation address if resolved
        if (transfer.destinationFederationAddress) {
            newAddress.federation_address = transfer.destinationFederationAddress
        }
        //add record
        activeAccount.addressBook = {...activeAccount.addressBook, [transfer.destination]: newAddress}
        //save account properties
        persistAccountInBrowser(activeAccount)
            .catch(() => {
            })
        //hide editor
        setEditorVisible(false)
    }, [transfer])

    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13) {
            saveName()
        }
    }, [])


    const chooseAddress = useCallback(function (e) {
        const address = e.target.dataset.address
        transfer.setDestination(address)
        transfer.setDestinationInputValue(address)
        //check if memo attached to the address book record and use it
        const {memo} = activeAccount.addressBook[address] || {}
        if (memo && memo.type) {
            setMemo(transfer, memo.type, memo.value || '')
            runInAction(() => {
                transfer.encodeMuxedAddress = memo?.encodeMuxedAddress || false
            })
        }
    }, [])

    const showEditor = useCallback(function () {
        setEditorVisible(true)
    }, [])

    const updateName = useCallback(function (e) {
        setTitle(e.target.value)
    }, [])

    return <div className="address-list-block relative">
        <div>
            {destinationSuggestions.map(address =>
                <AccountAddress key={address} account={address} chars={12} link={false} data-address={address}
                                title={resolveAddressTitle(address)} onClick={chooseAddress}/>)}
            {destination && !editorVisible && !destinationSuggestions.length &&
                <a className="add-address dimmed text-center" onClick={showEditor}>
                    Add this address to your Address Book?
                </a>}
            {editorVisible && <div className="add-name-address">
                <input type="text" defaultValue={title} onChange={updateName} onKeyDown={onKeyDown} placeholder="Name"/>
                <div className="space">
                    <Button block disabled={!title} onClick={saveName}>Save</Button>
                </div>
            </div>}
        </div>
    </div>
})

/**
 * Resolve friendly name for a given address
 * @param {String} address
 * @return {String}
 */
function resolveAddressTitle(address) {
    const fromAddressBook = accountManager.activeAccount.addressBook[address]
    if (fromAddressBook)
        return fromAddressBook.name
    const otherAccount = accountManager.get(address)
    if (otherAccount)
        return otherAccount.shortDisplayName
}

/**
 * Get live-typing destination address suggestions
 * @return {String[]}
 */
function getDestinationSuggestions(filter) {
    const {activeAccount} = accountManager
    const search = filter ? filter.toLowerCase() : null
    const res = []
    //add accounts from the orderbook
    for (const [address, info] of Object.entries(activeAccount.addressBook)) {
        if (filter &&
            !address.toLowerCase().startsWith(filter) &&
            !info.name.toLowerCase().includes(search) &&
            !info.federation_address?.toLowerCase().includes(search)
        )
            continue
        res.push(address)
    }
    //add other accounts
    for (const {publicKey} of accountManager.accounts) {
        if (activeAccount.publicKey !== publicKey && !res.includes(publicKey)) {
            res.push(publicKey)
        }
    }
    return res
}