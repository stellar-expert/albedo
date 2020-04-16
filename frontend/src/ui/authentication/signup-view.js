import React from 'react'
import {observer} from 'mobx-react'
import {Keypair} from 'stellar-base'
import Account, {ACCOUNT_TYPES} from '../../state/account'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import Credentials from '../../state/credentials'
import DialogContainer from '../layout/dialog-container-view'
import CredentialsRequest from './credentials-request-view'
import Onboarding from '../components/onboarding'
import errors from '../../util/errors'

@observer
class SignupView extends React.Component {
    state = {
        id: '',
        onBoardingInfoShown: false,
        error: null,
        inProgress: false,
        done: false
    }

    async saveAccount(data) {
        this.setState({inProgress: true})
        try {
            const {id, password} = data
            let account = accountManager.get(id)

            if (!account) {
                if (data.type === ACCOUNT_TYPES.STORED_ACCOUNT) {
                    account = new Account({id})
                    const credentials = await Credentials.create({account, password})
                    //add default keypair
                    const sensitiveData = account.requestSensitiveData(credentials)
                    sensitiveData.addOrUpdateKeypair({secret: Keypair.random().secret(), friendlyName: 'default'})
                    await account.updateSensitiveData(credentials, sensitiveData)

                    account = await Account.signup(credentials)
                } else {
                    account = await accountManager.loginHWAccount(data)
                }
                accountManager.addAccount(account)
            } else {
                const credentials = await Credentials.create({account, password})
                await account.load(credentials)
            }
            accountManager.setActiveAccount(account)
            //restore default state
            this.setState({inProgress: false, done: true})
            //route
            setTimeout(() => __history.push(actionContext.intent ? '/confirm' : '/'), 4000)
        } catch (e) {
            console.error(e)
            if (!e.status) {
                e = errors.unhandledError()
            }
            this.setState({inProgress: false})
            alert(e.message)
        }
    }

    renderSignupStep() {
        const {inProgress} = this.state
        return <CredentialsRequest title="Sign Up" requestEmail requestPassword requestPasswordConfirmation
                                   noRegistrationLink showLoginLink
                                   confirmText="Create account" inProgress={inProgress}
                                   onConfirm={data => this.saveAccount(data)}
                                   onCancel={() => actionContext.cancelAction()}>
            <div className="text-center dimmed">
                <div className="dimmed space text-small">
                    <p>
                        Account data will be encrypted with your password in the browser and
                        securely stored on our servers.
                        You will be able to log in and sync your credentials across multiple devices.
                    </p>
                    <p>
                        We don't have access to your password or encrypted data.
                        So do not forget the password, we won't be able to recover your data or password itself if it's
                        lost.
                    </p>
                </div>
            </div>
        </CredentialsRequest>
    }

    render() {
        const {done, onBoardingInfoShown} = this.state
        if (done) return <DialogContainer>
            <h2>Sign Up</h2>
            <div className="space text-center">Congratulations!<br/>You are all set.</div>

        </DialogContainer>
        if (!onBoardingInfoShown) return <Onboarding onFinish={() => this.setState({onBoardingInfoShown: true})}/>
        return this.renderSignupStep()
    }
}

export default SignupView
