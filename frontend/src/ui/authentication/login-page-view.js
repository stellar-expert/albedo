import React from 'react'
import CredentialsRequest from './credentials-request-view'
import accountManager from '../../state/account-manager'
import Account, {ACCOUNT_TYPES} from '../../state/account'
import Credentials from '../../state/credentials'
import actionContext from '../../state/action-context'
import errors from '../../util/errors'

export default class LoginPageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {inProgress: false}
    }

    async login(data) {
        this.setState({inProgress: true})
        try {
            let account
            if (data.type === ACCOUNT_TYPES.STORED_ACCOUNT) {
                const {id, password, totp} = data
                account = accountManager.get(id) || new Account({id})
                const credentials = await Credentials.create({account, password, totp})
                await account.load(credentials)
            } else {
                account = await accountManager.loginHWAccount(data)
            }
            accountManager.addAccount(account)
            accountManager.setActiveAccount(account)
            //restore default state
            this.setState({inProgress: false})
            //route
            __history.push(actionContext.intent ? '/confirm' : '/')
        } catch (e) {
            console.error(e)
            if (!e.status) {
                e = errors.unhandledError
            }
            this.setState({inProgress: false})
            alert(e.message)
        }
    }

    render() {
        return <CredentialsRequest title="Sign In" confirmText="Sign in" requestEmail requestPassword
                                   onConfirm={data => this.login(data)} onCancel={() => this.cancel()}/>
    }
}
