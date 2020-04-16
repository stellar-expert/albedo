import React from 'react'
import PropTypes from 'prop-types'
import errors from '../../util/errors'
import accountManager from '../../state/account-manager'
import Account from '../../state/account'
import Credentials from '../../state/credentials'
import CredentialsRequest from './credentials-request-view'
import authorizationService from '../../state/authorization'

class AuthorizationRequestView extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.defaultState
    }

    get defaultState() {
        return {
            email: '',
            account: null,
            inProgress: false,
            requestEmail: false,
            requestPassword: false,
            requestTotp: false,
            noHW: false
        }
    }

    componentDidMount() {
        this.requestAuthorization()
    }

    requestAuthorization(requireTotpCode = false) {
        const {account} = authorizationService,
            newState = {
                requestEmail: true,
                requestPassword: true,
                requestTotp: true,
                noHW: !account.isHWAccount
            }

        if (typeof account === 'string') {
            newState.email = account
        }

        if (account instanceof Account) {
            Object.assign(newState, {
                email: account.id,
                requestEmail: false,
                account,
                requestTotp: !!requireTotpCode
            })
        }

        this.setState(newState)
    }

    componentWillUnmount() {
        window.requestAuthorization = undefined
    }

    async submit(data) {
        const {id, password, totp} = data,
            account = this.state.account || accountManager.get(id) || new Account({id}),
            credentials = await Credentials.create({account, password, totp})

        this.setState({inProgress: true})

        try {
            //if (totp) { //fetch account from the server if TOTP is provided
            await account.load(credentials) //always fetch from the server to sync everything

            authorizationService.credentialsRequestCallback.resolve(credentials)
            //restore default state
            this.setState(this.defaultState)
        } catch (e) {
            this.setState({inProgress: false})
            console.error(e)
            if (e.status === 404) {
                this.setState({error: 'Invalid email or password. Please try again.'})
                return
            }
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
        return <CredentialsRequest title={`Authorization for ${this.state.email}`}
                                   confirmText="Confirm"
                                   modal
                                   onConfirm={data => this.submit(data)}
                                   onCancel={() => this.cancel()}
                                   {...this.state}>
        </CredentialsRequest>
    }
}

export default AuthorizationRequestView
