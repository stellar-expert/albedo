import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import accountManager from '../../state/account-manager'
import authorizationService from '../../state/authorization'
import Dropdown from '../components/dropdown'
import errors from '../../util/errors'

async function modifyAccountData(modifySensitiveDataCallback) {
    try {
        const {activeAccount} = accountManager
        //request user confirmation
        const credentials = await authorizationService.requestAuthorization(activeAccount)
        //fetch fresh data from the server to minimize collisions possibility - we already fetch it upon login in the requestAuthorization method
        //await activeAccount.load(credentials)
        //get sensitive keypairs data
        const sensitiveData = activeAccount.requestSensitiveData(credentials)
        //execute an action
        modifySensitiveDataCallback(sensitiveData)
        //update the data
        await activeAccount.updateSensitiveData(credentials, sensitiveData)
        //save account on the server and in browser
        await activeAccount.save(credentials)
    } catch (e) {
        console.error(e)
        //unhandled
        if (!e.status) {
            e = errors.unhandledError()
        }
        alert(e.message)
    }
}

async function initiateKeypairAction(action, keypair) {
    switch (action) {
        case 'rename':
            keypair.nameEditorVisible = true
            break
        case 'remove':
            if (confirm('Are you sure that you want to remove this key?')) {
                await modifyAccountData(sensitiveData => {
                    sensitiveData.removeKeypair(keypair.publicKey)
                })
            }
            break
    }
}

class KeypairNameEditorView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: props.keypair.friendlyName || ''
        }
    }

    confirm() {
        const {publicKey} = this.props.keypair
        modifyAccountData(sensitiveData => {
            const secret = sensitiveData.getSecret(publicKey)
            sensitiveData.addOrUpdateKeypair({secret, friendlyName: this.state.name || ''})
        })
            .then(() => this.hideEditor())
    }

    cancel() {
        this.hideEditor()
        this.setState({name: this.props.keypair.friendlyName || ''})
    }

    hideEditor() {
        this.props.keypair.nameEditorVisible = false
    }

    onKeyDown(e) {
        //handle Esc key
        if (e.keyCode === 27) {
            this.cancel()
        }
        //handle Enter key
        if (e.keyCode === 13) {
            this.confirm()
        }
    }

    render() {
        const {keypair} = this.props
        return <>
            <input ref={i => i && setTimeout(() => i && i.focus(), 200)} maxLength={40}
                   value={this.state.name} onChange={e => this.setState({name: e.target.value})}
                   style={{width: '10em', padding: 0, margin: 0, height: 'auto'}}
                   onKeyDown={e => this.onKeyDown(e)}/>&emsp;
            <a href="#" className="fa fa-check-circle-o" onClick={() => this.confirm()} title="Confirm"/>{' '}
            <a href="#" className="fa fa-times-circle-o" onClick={() => this.cancel()} title="Cancel"/>
        </>
    }
}

function KeypairView({keypair}) {
    const actions = [
        {value: 'icon', title: <i className="fa fa-cog" title="Settings"/>, hidden: true},
        {value: 'rename', title: 'Change display name'},
        {value: 'remove', title: 'Delete this signing key'}
    ]
    return <span className="keypair block-indent-screen">
            <i className="fa fa-key dimmed text-small"/>&nbsp;
        {keypair.nameEditorVisible ? <KeypairNameEditorView keypair={keypair}/> : <>
            {keypair.displayName}&emsp;
            <CopyToClipboard text={keypair.publicKey}>
                <a href="#" className="fa fa-copy active-icon" title="Copy public key to clipboard"/>
            </CopyToClipboard>
            <Dropdown options={actions} onChange={action => initiateKeypairAction(action, keypair)} value="icon"
                      showToggle={false}/>
        </>}
        </span>
}

export default observer(KeypairView)