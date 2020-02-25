import React from 'react'
import PropTypes from 'prop-types'
import {parseQuery} from '../../util/url-utils'
import {ACCOUNT_TYPES} from '../../state/account'
import DialogContainer from '../layout/dialog-container-view'
import Actions from '../components/actions-block'
import Lightbox from '../components/lightbox'
import HardwareWalletSelectorView from './hardware-wallet-selector-view'

class CredentialsRequestView extends React.Component {
    constructor(props) {
        super(props)
        this.state = Object.assign(this.defaultState, {email: props.email || parseQuery()['email'] || ''})
        this.firstInput = React.createRef()
    }

    static propTypes = {
        //dialog title
        title: PropTypes.string.isRequired,
        //text to display as a Confirm button caption
        confirmText: PropTypes.string,
        //user presses Enter key
        onConfirm: PropTypes.func.isRequired,
        //user presses Esc key
        onCancel: PropTypes.func.isRequired,
        //optional extra elements to render
        children: PropTypes.any,
        //request email address
        requestEmail: PropTypes.bool,
        //request password
        requestPassword: PropTypes.bool,
        //request password confirmation
        requestPasswordConfirmation: PropTypes.bool,
        //request 2FA code
        //requestTotp: PropTypes.bool,
        //show in modal dialog
        modal: PropTypes.bool,
        //action is in progress
        inProgress: PropTypes.bool,
        //whether to show "create account" link or not
        noRegistrationLink: PropTypes.bool,
        //whether to show "log in" link or not
        showLoginLink: PropTypes.bool,
        //whether to show hardware wallet options
        noHW: PropTypes.bool,
        //default values for requested fields
        defaults: PropTypes.object
    }

    get defaultState() {
        return {
            email: '',
            password: '',
            confirmation: '',
            totp: '',
            validationError: null
        }
    }

    focusFirstInput() {
        setTimeout(() => {
            const input = this.firstInput.current
            input && input.focus()
        }, 200)
    }

    componentDidMount() {
        this.focusFirstInput()
    }

    componentWillReceiveProps(newProps) {
        this.setState(Object.assign(this.defaultState, {email: newProps.email || ''}), () => this.focusFirstInput())
    }

    confirm() {
        const validationError = this.validate()
        if (validationError) {
            this.setState({validationError})
        } else {
            const {email, password, totp} = this.state
            this.setState(this.defaultState)
            this.props.onConfirm({id: email, password, totp, type: ACCOUNT_TYPES.STORED_ACCOUNT})
        }
    }

    hardwareLogin({id, path, type, publicKey}) {
        this.setState(this.defaultState)
        this.props.onConfirm({id, path, type, publicKey})
    }

    cancel() {
        this.props.onCancel(this.state)
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

    submit(e) {
        e.preventDefault()
        this.confirm()
    }

    validate() {
        const {email, password, confirmation, totp} = this.state
        if (this.props.requestEmail && !/^\S+@\S+.\S+$/.test(email)) return 'Invalid email'
        if (this.props.requestPassword && password.length < 8) return 'Password too short'
        if (this.props.requestPasswordConfirmation && password !== confirmation) return 'Passwords do not match'
        //if (this.props.requestTotp && totp.length !== 6) return 'Invalid 2FA code'
        return null
    }

    setValue(name, value) {
        if (name === 'totp') {
            value = value.replace(/\D/g, '')
        } else {
            value = value.trim()
        }
        this.setState({
            [name]: value,
            validationError: null
        }, () => {
            const {onConfirm, requestPassword, requestEmail} = this.props
            //onChange(this.state)
            //auto-submit only if TOTP has been requested
            if (name === 'totp' && !this.validate() && !requestPassword && !requestEmail) {
                onConfirm(this.state)
            }
        })
    }

    renderFields() {
        const {requestEmail, requestPassword, requestPasswordConfirmation, requestTotp} = this.props,
            {email, password, confirmation, totp} = this.state
        return <>
            {requestEmail && <div>
                <input type="email" name="email" placeholder="Email address" autoComplete="email" ref={this.firstInput}
                       value={email || ''} onChange={e => this.setValue('email', e.target.value)}
                       onKeyDown={e => this.onKeyDown(e)}/>
            </div>}
            {requestPassword && <div>
                <input type="password" name="password" placeholder="Password"
                       ref={requestEmail ? undefined : this.firstInput}
                       value={password || ''} onChange={e => this.setValue('password', e.target.value)}
                       onKeyDown={e => this.onKeyDown(e)}/>
            </div>}
            {requestPasswordConfirmation && <div>
                <input type="password" name="confirmation" placeholder="Password confirmation"
                       value={confirmation || ''} onChange={e => this.setValue('confirmation', e.target.value)}
                       onKeyDown={e => this.onKeyDown(e)}/>
            </div>}
            {/*{requestTotp && <div>
                <input type="text" name="totp" placeholder="6-digits 2FA code" autoComplete="off" autoCorrect="off"
                       value={totp || ''} maxLength={6} onChange={e => this.setValue('totp', e.target.value)}
                       onKeyDown={e => this.onKeyDown(e)}
                />
            </div>}*/}
        </>
    }

    renderControls() {
        const {onConfirm, onCancel, confirmText = 'Confirm', inProgress} = this.props
        if (!onConfirm && !onCancel) return null
        return <Actions className="row">
            {onConfirm && <div className="column column-50">
                <button className="button button-block" disabled={!!inProgress} onClick={() => this.confirm()}>
                    {confirmText}
                </button>
            </div>}
            {onCancel && <div className="column column-50">
                <button className="button button-outline button-block" onClick={() => onCancel()}>
                    Cancel
                </button>
            </div>}
        </Actions>
    }

    renderErrors() {
        const {validationError} = this.state
        if (validationError) return <div className="error space">Error: {validationError}</div>
    }

    renderContent() {
        const {title, children, noRegistrationLink = false, showLoginLink = false, noHW = false} = this.props
        return <>
            <h2>{title}</h2>
            <div className="space"/>
            <form onSubmit={e => this.submit(e)} action="/credentials" method="POST" target="dummy">
                {this.renderFields()}
            </form>
            {this.renderControls()}
            {this.renderErrors()}
            {!noRegistrationLink && <div className="text-center dimmed">
                Not registered yet?<br/><a href="/signup">Create new account</a>
            </div>}
            {showLoginLink && <div className="text-center dimmed">
                Already registered?<br/><a href="/login">Log in to existing account</a>
            </div>}
            {!noHW && <>
                <hr className="double-space" title="or use hardware wallet"/>
                <HardwareWalletSelectorView requirePublicKey onConfirm={data => this.hardwareLogin(data)}/>
            </>}
            {children || null}
        </>
    }

    render() {
        const {modal} = this.props
        return modal ?
            <Lightbox>{this.renderContent()}</Lightbox> :
            <DialogContainer>{this.renderContent()}</DialogContainer>
    }
}

export default CredentialsRequestView
