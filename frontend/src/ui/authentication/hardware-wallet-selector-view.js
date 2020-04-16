import React, {Component} from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import AlbedoSigner from '../../util/hw-signer/hw-signer'
import Actions from '../components/actions-block'
import {ACCOUNT_TYPES} from '../../state/account'
import appSettings from '../../state/app-settings'

class HardwareWalletSelectorView extends Component {
    state = {
        isDefaultPath: true,
        path: '',
        accountType: undefined
    }

    static propTypes = {
        requirePublicKey: PropTypes.bool,
        onConfirm: PropTypes.func.isRequired
    }

    async connect(event) {
        const {path, accountType} = this.state
        this.setState({inProgress: true})
        const signer = new AlbedoSigner(accountType)
        await signer.init({
            appManifest: {
                email: appSettings.appManifest.email,
                appUrl: appSettings.appManifest.appUrl
            }
        })

        const result = {
            id: await signer.getDeviceId(),
            path,
            type: accountType,
            publicKey: this.props.requirePublicKey ? await signer.getPublicKey({path}) : undefined
        }

        //TODO: handle errors
        this.props.onConfirm(result)
    }

    setHardwareWalletType(type) {
        this.setState({
            accountType: type,
            path: `m/44'/148'/0'`
        })
    }

    renderPathSelector() {
        const {isDefaultPath, path, accountType} = this.state
        if (!accountType) return
        return <div className="space">
            <label style={{display: 'inline'}}>
                <input type="checkbox" checked={isDefaultPath}
                       onChange={() => this.setState({isDefaultPath: !isDefaultPath})}/> Use default BIP32 path
            </label>&emsp;
            {!isDefaultPath && <input type="text" value={path} style={{width: '10em'}}
                                      onChange={e => this.setState({path: e.target.value})}/>}
            <button className="button" onClick={() => this.connect()}>Connect</button>
            <div className="dimmed text-small">
                Make sure you connected the hardware wallet and follow the instructions on the display of your device.
            </div>
        </div>
    }

    render() {
        const {accountType} = this.state
        return <div className="hw-selector">
            <Actions className="row">
                <div className="column column-50">
                    <a href="#" id="ledger-signup" title="Ledger Nano"
                       className={cn('button button-block keypair-selector-option', {'button-outline': accountType !== ACCOUNT_TYPES.LEDGER_ACCOUNT})}
                       onClick={() => this.setHardwareWalletType(ACCOUNT_TYPES.LEDGER_ACCOUNT)}>
                        <img src="/img/vendor/ledger.svg"/>
                    </a>
                </div>
                <div className="column column-50">
                    <a href="#" id="trezor-signup" title="Trezor"
                       className={cn('button button-block keypair-selector-option', {'button-outline': accountType !== ACCOUNT_TYPES.TREZOR_ACCOUNT})}
                       onClick={() => this.setHardwareWalletType(ACCOUNT_TYPES.TREZOR_ACCOUNT)}>
                        <img src="/img/vendor/trezor.svg"/>
                    </a>
                </div>
            </Actions>
            {this.renderPathSelector()}
        </div>
    }
}

export default HardwareWalletSelectorView
