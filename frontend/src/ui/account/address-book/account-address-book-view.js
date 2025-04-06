import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from '@stellar/stellar-base'
import {Button, Dialog} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../../state/account-manager'
import actionContext from '../../../state/action-context'
import authorizationService from '../../../state/auth/authorization'
import ActionLoaderView from '../../wallet/shared/action-loader-view'
import WalletPageActionDescription from '../../wallet/shared/wallet-page-action-description'
import WalletOperationsWrapperView from '../../wallet/shared/wallet-operations-wrapper-view'
import AccountContextView from '../account-context-view'
import AccountAddressBookForm from './account-address-book-form'
import AddressBookEntryView from './address-book-entry-view'

export const addressBlank = {
    'name': '',
    'memo': {
        'type': 'none',
        'value': ''
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
    if (!addressSettings)
        return false
    if (!addressSettings.name)
        return false
    if (!StrKey.isValidEd25519PublicKey(addressSettings.address) && !StrKey.isValidMed25519PublicKey(addressSettings.address))
        return false
    if (addressSettings.memo?.type !== 'none' && !addressSettings.memo?.value)
        return false
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

    const editAddress = useCallback((address) => {
        const curAddress = address ? {...addressBook[address]} : addressBlank
        setAddressSettings({
            address,
            ...curAddress
        })
        setEditAction(!!address)
        setDialogOpen(true)
    }, [addressBook, setAddressSettings])

    const addAddress = useCallback(() => {
        editAddress(null)
    }, [editAddress])

    const saveAddressBook = useCallback((copyAddressBook) => {
        delete copyAddressBook.editMode
        activeAccount.addressBook = copyAddressBook
        setAddressBook(copyAddressBook)
        activeAccount.save(credentials)
            .catch(e => console.error(e))
        setDialogOpen(false)
    }, [activeAccount, credentials])

    const saveAddress = useCallback(() => {
        const copyAddressBook = {...addressBook}
        const {address, ...otherSettings} = addressSettings
        copyAddressBook[address] = otherSettings
        copyAddressBook[address].name = addressSettings.name.trim()
        saveAddressBook(copyAddressBook)
    }, [addressSettings, addressBook, saveAddressBook])

    const removeAddress = useCallback(async address => {
        await confirm('Do you really want to remove this address?', {
            title: 'Remove from address book',
            icon: 'warning-circle'
        })
        const copyAddressBook = {...addressBook}
        delete copyAddressBook[address]
        saveAddressBook(copyAddressBook)
    }, [addressBook, saveAddressBook])

    if (!credentials)
        return <AccountContextView>
            <ActionLoaderView message="waiting for authorization"/>
        </AccountContextView>

    const entries = Object.entries(addressBook)
    return <AccountContextView>
        <WalletOperationsWrapperView title="Address book" allowNonExisting>
            <hr className="flare"/>
            <WalletPageActionDescription>frequently used addresses and trusted contacts</WalletPageActionDescription>
            {entries.length ? entries.map(([address, addressProps]) =>
                    <AddressBookEntryView key={address} addressSettings={[address, addressProps]}
                                          editAddress={editAddress} removeAddress={removeAddress}/>) :
                <div className="space text-small text-center dimmed">(No addresses in the Address Book yet)</div>}
            <div className="row actions double-space">
                <div className="column column-50">
                    <Button block onClick={addAddress}><i className="icon-add-circle"/> Add new address</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={finish}>Back</Button>
                </div>
            </div>
            {addressSettings && <Dialog dialogOpen={dialogOpen}>
                <h2>{editAction ? 'Edit' : 'Add new'} address</h2>
                <AccountAddressBookForm addressSettings={addressSettings} setAddressSettings={setAddressSettings}/>
                <div className="row actions space">
                    <div className="column column-50">
                        <Button block disabled={!isValid(addressSettings)} onClick={saveAddress}>Save</Button>
                    </div>
                    <div className="column column-50">
                        <Button block outline onClick={() => setDialogOpen(false)}>Cancel</Button>
                    </div>
                </div>
            </Dialog>}
        </WalletOperationsWrapperView>
    </AccountContextView>
}

export default observer(AccountAddressBookView)