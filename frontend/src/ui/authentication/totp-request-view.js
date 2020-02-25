import React, {Component} from 'react'
import PropTypes from 'prop-types'

class TotpRequestView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            totp: '',
            visible: false
        }
    }

    static propTypes = {
        onChange: PropTypes.func
    }

    //TODO: invalidate TOTP token in 30 seconds after input

    setTotp(value) {
        value = value.replace(/\D/g, '')
        this.setState({totp: value}, () => {
            if (value.length === 6) {
                const {onChange} = this.props
                if (onChange) {
                    onChange(value)
                }
            }
        })
    }

    render() {
        const {totp, visible} = this.state
        return <div>
            <input type="text" maxLength={6} autoComplete="off" autoCorrect="off" value={totp}
                   onChange={e => this.setTotp(e.target.value)} placeholder="6-digits 2FA code"/>
        </div>
    }
}

export default TotpRequestView