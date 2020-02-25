import React from 'react'
import PropTypes from 'prop-types'
import errors from '../../util/errors'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import Account from '../../state/account'
import Credentials from '../../state/credentials'
import CredentialsRequest from './credentials-request-view'

class AuthorizationRequestView extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.defaultState
    }

    get defaultState() {
        return {
            email: '',
            account: null,
            visible: false,
            inProgress: false,
            requestEmail: false,
            requestPassword: false,
            requestTotp: false,
            noHW: false,
            resolve: undefined,
            reject: undefined
        }
    }

    componentDidMount() {
        //expose static methods for login requests
        window.requestAuthorization = this.requestAuthorization.bind(this)
    }

    requestAuthorization(account, requireTotpCode = false) {
        return new Promise((resolve, reject) => {
            const newState = {
                visible: true,
                requestEmail: true,
                requestPassword: true,
                requestTotp: true,
                noHW: !account.isHWAccount,
                resolve,
                reject
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
        })
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
            if (totp) { //fetch account from the server
                await account.load(credentials)
            }
            const {resolve} = this.state
            //finalize request
            if (resolve) {
                resolve(credentials)
            } else {
                //route
                __history.push(actionContext.intent ? '/confirm' : '/')
            }
            //restore default state
            this.setState(this.defaultState)
        } catch (e) {
            //unhandled
            if (!e.status) {
                e = errors.unhandledError
            }
            const {reject} = this.state
            if (reject) {
                reject(e)
            } else {
                console.error(e)
                alert(e.message)
            }
        }
    }

    cancel() {

    }

    render() {
        const {visible, ...reqProps} = this.state
        if (!visible) return null
        return <CredentialsRequest title={`Authorization for ${this.state.email}`}
                                   confirmText="Confirm"
                                   modal
                                   onConfirm={data => this.submit(data)}
                                   onCancel={() => this.cancel()}
                                   {...reqProps}>
        </CredentialsRequest>
    }
}

export default AuthorizationRequestView
