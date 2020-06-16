import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import errors from '../../util/errors'
import accountManager from '../../state/account-manager'
import Account from '../../state/account'
import Credentials from '../../state/credentials'
import CredentialsRequest from './credentials-request-view'
import authorizationService from '../../state/authorization'

@observer
class AuthorizationRequestView extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.defaultState
    }

    get defaultState() {
        return {
            account: null,
            inProgress: false,
            noHW: false,
            error: null
        }
    }

    componentDidMount() {
        this.requestAuthorization()
    }

    requestAuthorization() {
        const {account} = authorizationService,
            newState = {
                noHW: !account.isHWAccount,
                account
            }
        this.setState(newState)
    }

    componentWillUnmount() {
        window.requestAuthorization = undefined
    }

    async submit(data) {
        this.setState({inProgress: true, error: null})
        const {id, password} = data,
            account = this.state.account || accountManager.get(id) || new Account({id}),
            credentials = await Credentials.create({account, password})

        if (!credentials.checkPasswordCorrect()) {
            this.setState({inProgress: false, error: 'Invalid password'})
            return
        }
        try {
            authorizationService.credentialsRequestCallback.resolve(credentials)
            //restore default state
            this.setState(this.defaultState)
        } catch (e) {
            this.setState({inProgress: false})
            console.error(e)
            //unhandled
            if (!e.status) {
                e = errors.unhandledError()
            }
            if (authorizationService.credentialsRequestCallback) {
                authorizationService.credentialsRequestCallback.reject(e)
            } else {
                alert(e.message)
            }
        }
    }

    cancel() {
        if (authorizationService.credentialsRequestCallback) {
            authorizationService.credentialsRequestCallback.reject(new Error(`Authorization was cancelled by a user.`))
        } else {
            __history.push('/')
        }
    }

    render() {
        if (!authorizationService.dialogOpen) return null
        const {account} = this.state
        if (!account) return null
        return <div>
            <h2>Authorization for {account.friendlyName}</h2>
            <div className="space text-small dimmed">
                Please provide your password
            </div>
            <CredentialsRequest confirmText="Confirm" noRegistrationLink {...this.state}
                                onConfirm={data => this.submit(data)} onCancel={() => this.cancel()}/>
        </div>
    }
}

export default AuthorizationRequestView
