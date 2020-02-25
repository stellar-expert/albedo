import React from 'react'
import PropTypes from 'prop-types'
import StellarBase from 'stellar-base'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'

function prepareState(props) {
    return {
        account: accountManager.get(props.match.params.account),
        password: '',
        confirmation: ''
    }
}

@observer
class SetPasswordView extends React.Component {
    constructor(props) {
        super(props)
        this.state = prepareState(props)
    }

    componentWillReceiveProps(nextProps) {
        this.setState(prepareState(nextProps))
    }

    validatePassword() {
        if (!this.state.password) return 'Please provide a valid password'
        if (!this.state.confirmation) return 'Please confirm a password'
        if (this.state.password.length < 8) return 'Password should be at least 8 characters long'
        if (this.state.password !== this.state.confirmation) return 'Passwords do not match'
    }

    setPassword() {
        let validationResult = this.validatePassword()
        if (validationResult) return alert(validationResult)
        const {account, password} = this.state
        account.setPassword(password)
            .next(() => __history.push(account.setup ? `/account/${account.address}/multi-login` : ''))
    }

    render() {
        const {account, password, confirmation} = this.state
        return <div>
            <h2>Set password for account {account.address}</h2>
            <div>
                Stellar secret key is hard to remember and it's not always at hand. You can set a password to
                encrypt your secret key and store it in the browser.
            </div>
            <div>
                <input type="password" placeholder="Type password here (at least 8 characters)"
                       value={password} onChange={e => this.setState({password: e.target.value})}/>
            </div>
            <div>
                <input type="password" placeholder="Confirm password"
                       value={confirmation} onChange={e => this.setState({confirmation: e.target.value})}/>
            </div>

            <div className="actions">
                <button className="button" disabled={!(this.state.password && this.state.confirmation)} onClick={e => this.setPassword()}>
                    Set Password
                </button>
                <a href="/">Cancel</a>
            </div>
        </div>
    }
}

export default SetPasswordView