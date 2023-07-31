import React from 'react'
import {observer} from 'mobx-react'
import {useDirectory} from '@stellar-expert/ui-framework'
import {resolveFederationName} from '../../../util/federation-address-resolver'
import accountManager from '../../../state/account-manager'
import './transfer-destination-title.scss'


async function getAccountPredefinedDisplayName(destinationInfo) {
    if (window.predefinedAccountDisplayNames)
        return window.predefinedAccountDisplayNames[destinationInfo.account_id]
    const federationAddress = await resolveFederationName(destinationInfo)
    if (federationAddress)
        return federationAddress.split('*')[0]
    return undefined
}

export default observer(function TransferDestinationTitleView({transfer}) {
    const directoryInfo = useDirectory(transfer.destination)
    let title = transfer.destination && accountManager.get(transfer.destination)?.friendlyName
    let dangerous = false
    if (!title && directoryInfo) {
        title = directoryInfo.name
        if (directoryInfo.domain) {
            title += ' - ' + directoryInfo.domain
        }
        if (directoryInfo?.tags?.includes('malicious') || directoryInfo?.tags?.includes('unsafe')) {
            dangerous = true
        }
    }
    if (!title)
        return null
    return <div className="dimmed condensed text-tiny destination-title">
        {dangerous && <span className="icon icon-warning"/>}[{title}]
    </div>
})