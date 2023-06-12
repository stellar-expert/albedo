import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {StrKey, decodeAddressToMuxedAccount, encodeMuxedAccountToAddress} from 'stellar-sdk'
import DialogView from '../../layout/dialog-view'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import authorizationService from '../../../state/auth/authorization'
import SoloLayoutView from '../../layout/solo-layout-view'
import ActionLoaderView from '../../wallet/shared/action-loader-view'
import AccountAddressbookForm from './account-address-book-form'
import AccountAddressListView from './account-address-list-view'

export const addressBlank = {
    "name": "",
    "network": "public",
    "federation_address": "",
    "memo": {
        "type": "none",
        "value": "",
        "encodeMuxedAddress": false
    }
}

function finish() {
    if (!actionContext.intent) {
        navigation.navigate('/account')
    } else {
        navigation.navigate('/confirm')
    }
}

function isValid(addressSettings) {
    if (!addressSettings) return false 
    if (!addressSettings.name) return false 
    if (!StrKey.isValidEd25519PublicKey(addressSettings.address) && !StrKey.isValidMed25519PublicKey(addressSettings.address)) return false
    if (addressSettings.memo && addressSettings.memo.type !== 'none' && !addressSettings.memo.value) return false
    return true
}

function AccountAddressBookView() {
    const {activeAccount} = accountManager
    const [dialogOpen, setDialogOpen] = useState(true)
    const [addressBook, setAddressBook] = useState(activeAccount.addressBook || {})
    const [addressSettings, setAddressSettings] = useState()
    
    // console.log('GA6H66VCFV2IFSERGV6VBH2UXQHDN4ZDY2G7EMIPITRYPNUH6R6COOLN')
    // console.log(StrKey.encodeMed25519PublicKey('GA6H66VCFV2IFSERGV6VBH2UXQHDN4ZDY2G7EMIPITRYPNUH6R6COOLN'))
    // // console.log(decodeAddressToMuxedAccount('MBDUCNSIGY3FMQ2GKYZESRSTIVJEOVRWKZBEQMSVLBIUQRCOGRNEIWJSI43UKTKJKBEVIUSZKBHFKSBWKI3EGT2PJRHKSSQ'))
    // console.log(decodeAddressToMuxedAccount('GA6H66VCFV2IFSERGV6VBH2UXQHDN4ZDY2G7EMIPITRYPNUH6R6COOLN'))
    // console.log(StrKey.isValidMed25519PublicKey(StrKey.encodeMed25519PublicKey('GA6H66VCFV2IFSERGV6VBH2UXQHDN4ZDY2G7EMIPITRYPNUH6R6COOLN')))

    if (!activeAccount) window.location.href = '/'
    //account credentials
    const [credentials, setCredentials] = useState(() => {
        authorizationService.requestAuthorization(activeAccount)
            .then(credentials => setCredentials(credentials))
            .catch(err => {
                if (err && err.code === -4) { //rejected by user
                    finish()
                } else {
                    console.error(err)
                }
            })
    })
    
    const addEditAddress = useCallback((address) => {
        const curAddress = address ? {...addressBook[address]} : addressBlank
        setAddressSettings({
            address,
            editMode: address ? true : false,
            ...curAddress
        })
        setDialogOpen(true)
    })

    const saveAddress = useCallback(() => {
        const copyAddressBook = {...addressBook}
        const {address, ...otherSettings} = addressSettings
        copyAddressBook[address] = otherSettings
        copyAddressBook[address].name = addressSettings.name.trim()
        saveAddressBook(copyAddressBook)
    })

    const removeAddress = useCallback((address) => {
        let confirmation = `Do you really want to remove this address?`
        if (confirm(confirmation)) {
            const copyAddressBook = {...addressBook}
            delete copyAddressBook[address]
            saveAddressBook(copyAddressBook)
        }
    })

    function saveAddressBook(copyAddressBook) {
        delete copyAddressBook.editMode
        activeAccount.addressBook = copyAddressBook
        setAddressBook(copyAddressBook)
        activeAccount.save(credentials)
            .catch(e => console.error(e))
        setDialogOpen(false)
    }

    if (!credentials)
        return <SoloLayoutView title="Address book">
            <ActionLoaderView message="waiting for authorization"/>
        </SoloLayoutView>

    return <SoloLayoutView title="Address book" alignTop>
        <div className="text-small dimmed">
            Your address book where you can add/edit/delete addresses, also set the network type and memo for each of them
        </div>
        <div className="row space">
            <div className="column column-50 column-offset-25">
                <Button block outline onClick={() => addEditAddress()}><i className="icon-add-circle"/> Add new address</Button>
            </div>
        </div>
        <h3>Address Book</h3>
        {Object.keys(addressBook).length ? 
            <AccountAddressListView addressBook={addressBook} addEditAddress={addEditAddress} removeAddress={removeAddress}/> : 
            <div className="double-space text-small text-center dimmed">You have not yet added any address to your address book</div>}
        <div className="space row">
            <div className="column column-50 column-offset-25">
                <Button block outline onClick={finish}>Back</Button>
            </div>
        </div>
        {addressSettings && <DialogView dialogOpen={dialogOpen}>
            <h2>{addressSettings?.editMode ? 'Edit' : 'Add new'} address</h2>
            <AccountAddressbookForm addressSettings={addressSettings} setAddressSettings={setAddressSettings}/>
            <div className="row actions space">
                <div className="column column-50">
                    <Button block disabled={!isValid(addressSettings)} onClick={saveAddress}>Save</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={() => setDialogOpen(false)}>Cancel</Button>
                </div>
            </div>
        </DialogView>}
    </SoloLayoutView>
}

export default observer(AccountAddressBookView)
