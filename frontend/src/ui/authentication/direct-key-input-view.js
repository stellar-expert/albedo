import React from 'react'
import PropTypes from 'prop-types'
import {StrKey} from 'stellar-sdk'
import actionContext from '../../state/action-context'

class DirectKeyInputView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {secret: '', isValid: false}
    }

    setKey(secret) {
        secret = secret.replace(/[^a-zA-Z\d]/g, '')
        this.setState({secret, isValid: StrKey.isValidEd25519SecretSeed(secret)})
    }

    sign() {
        const {secret, isValid} = this.state
        if (isValid) {
            actionContext.secret = secret
            actionContext.confirmRequest()
                .catch(err => console.error(err))
            actionContext.directKeyInput = false
        }
    }

    render() {
        return <div>
            <div className="dimmed">Provide a secret key you'd like to use:</div>
            <input type="text" onChange={e => this.setKey(e.target.value)}
                   placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"/>
            <div>
                <button className="button" onClick={() => this.sign()}>Sign directly</button>
            </div>
        </div>
    }
}

export default DirectKeyInputView