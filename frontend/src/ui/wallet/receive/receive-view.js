import React from 'react'
import {Tabs} from '@stellar-expert/ui-framework'
import WalletOperationsWrapperView from '../shared/wallet-operations-wrapper-view'
import ReceiveRequestView from './receive-request-view'
import ReceiveAddressView from './receive-address-view'

const tabOptions = [
    {name: 'address', title: 'Share address', isDefault: true, render: () => <ReceiveAddressView/>},
    {name: 'request', title: 'Request payment', render: () => <ReceiveRequestView/>}
]

export default function ReceiveView() {
    return <WalletOperationsWrapperView title="Receive" allowNonExisting>
        <Tabs tabs={tabOptions} queryParam="mode" right/>
    </WalletOperationsWrapperView>
}