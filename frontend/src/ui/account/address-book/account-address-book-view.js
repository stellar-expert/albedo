import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {StrKey} from 'stellar-sdk'
import DialogView from '../../layout/dialog-view'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import authorizationService from '../../../state/auth/authorization'
import ActionLoaderView from '../../wallet/shared/action-loader-view'
import AccountAddressbookForm from './account-address-book-form'
import AccountAddressListView from './account-address-list-view'
import WalletPageActionDescription from '../../wallet/shared/wallet-page-action-description'
import WalletOperationsWrapperView from '../../wallet/shared/wallet-operations-wrapper-view'
import AccountContextView from '../account-context-view'

export const addressBlank = {
    "name": "",
    "memo": {
        "type": "none",
        "value": ""
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
    if (addressSettings.memo?.type !== 'none' && !addressSettings.memo?.value) return false
    return true
}

function AccountAddressBookView() {
    const {activeAccount} = accountManager
    const [dialogOpen, setDialogOpen] = useState(false)
    const [addressBook, setAddressBook] = useState(activeAccount.addressBook || {})
    const [addressSettings, setAddressSettings] = useState()
    const [editAction, setEditAction] = useState(false)

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
            ...curAddress
        })
        setEditAction(!!address)
        setDialogOpen(true)
    }, [addressBook])

    const saveAddress = useCallback(() => {
        const copyAddressBook = {...addressBook}
        const {address, ...otherSettings} = addressSettings
        copyAddressBook[address] = otherSettings
        copyAddressBook[address].name = addressSettings.name.trim()
        saveAddressBook(copyAddressBook)
    }, [addressSettings, addressBook, saveAddressBook])

    const removeAddress = useCallback((address) => {
        const confirmation = `Do you really want to remove this address?`
        if (confirm(confirmation)) {
            const copyAddressBook = {...addressBook}
            delete copyAddressBook[address]
            saveAddressBook(copyAddressBook)
        }
    }, [addressBook, saveAddressBook])

    function saveAddressBook(copyAddressBook) {
        delete copyAddressBook.editMode
        activeAccount.addressBook = copyAddressBook
        setAddressBook(copyAddressBook)
        activeAccount.save(credentials)
            .catch(e => console.error(e))
        setDialogOpen(false)
    }

    if (!credentials)
        return <AccountContextView>
            <ActionLoaderView message="waiting for authorization"/>
        </AccountContextView>

    return <AccountContextView>
        <WalletOperationsWrapperView title="Address book" allowNonExisting>
            <hr className="flare"/>
            <WalletPageActionDescription>frequently used addresses and trusted contacts</WalletPageActionDescription>
            <div className="space"/>
            {Object.keys(addressBook).length ?
                <AccountAddressListView addressBook={addressBook} addEditAddress={addEditAddress} removeAddress={removeAddress}/> :
                <div className="space text-small text-center dimmed">(No addresses in the Address Book yet)</div>}
            <div className="row actions double-space">
                <div className="column column-50">
                    <Button block onClick={() => addEditAddress(null)}><i className="icon-add-circle"/> Add new address</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={finish}>Back</Button>
                </div>
            </div>
            {addressSettings && <DialogView dialogOpen={dialogOpen}>
                <h2>{editAction ? 'Edit' : 'Add new'} address</h2>
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
        </WalletOperationsWrapperView>
    </AccountContextView>
}

export default observer(AccountAddressBookView)
