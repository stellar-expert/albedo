import React from 'react'
import PropTypes from 'prop-types'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Dropdown from '../components/dropdown'
import accountManager from '../../state/account-manager'

async function executeKeypairAction(action, keypair) {
    switch (action) {
        case 'remove':
            if (confirm('Are you sure that you want to remove this key?')) {
                const {activeAccount} = accountManager
                //request user confirmation
                const credentials = await window.requestAuthorization(activeAccount)
                //fetch fresh data from the server to minimize collisions possibility
                await activeAccount.load(credentials)
                //get sensitive keypairs data
                const sensitiveData = activeAccount.requestSensitiveData(credentials)
                //add/modify a keypair
                sensitiveData.removeKeypair(keypair.publicKey)
                //update the data
                await activeAccount.updateSensitiveData(credentials, sensitiveData)
                //save account on the server and in browser
                await activeAccount.save(credentials)
            }
    }
}

function KeypairView({keypair}) {
    const actions = [
        {value: 'icon', title: <i className="fa fa-cog" title="Settings"/>, hidden: true},
        {value: 'rename', title: 'Change display name'},
        {value: 'remove', title: 'Delete this signing key'}
    ]
    return <span className="keypair block-indent-screen">
            <i className="fa fa-key dimmed text-small"/> {keypair.displayName}&emsp;
        <CopyToClipboard text={keypair.publicKey}>
                <a href="#" className="fa fa-copy active-icon" title="Copy public key to clipboard"/>
            </CopyToClipboard>
            <Dropdown options={actions} onChange={action => executeKeypairAction(action, keypair)} value="icon"
                      showToggle={false}/>
        </span>
}

export default KeypairView