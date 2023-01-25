import React, {useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import actionContext from '../../state/action-context'
import SoloLayoutView from '../layout/solo-layout-view'
import OnBoardingNotesStepView from './onboarding-notes-step-view'
import SecretBackupStepView from './secret-backup-step-view'
import SignupSetPasswordStepView from './signup-set-password-step-view'

export default function SignupView({secret, skipOnboarding, skipSecretBackup}) {
    const [status, setStatus] = useState(skipOnboarding ? 'password' : 'onboarding')
    const [credentials, setCredentials] = useState(null)

    function updateCurrentStatus(newStatus) {
        setStatus(current => {
            if (newStatus !== current) {
                setTimeout(() => {
                    document.body.scrollIntoView({behavior: 'smooth'})
                }, 200)
            }
            return newStatus
        })
    }

    switch (status) {
        case 'onboarding':
            return <SoloLayoutView title="Welcome to Albedo">
                <OnBoardingNotesStepView onSuccess={() => updateCurrentStatus('password')}/>
            </SoloLayoutView>
        case 'password':
            return <SoloLayoutView title="Set Account Password">
                <SignupSetPasswordStepView secret={secret} onSuccess={(credentials) => {
                    setCredentials(credentials)
                    updateCurrentStatus('backup')
                }}/>
            </SoloLayoutView>
        case 'backup':
            if (skipSecretBackup || !credentials || !credentials.account.isStoredAccount) {
                updateCurrentStatus('finished')
                return null
            }
            return <SoloLayoutView title="Recovery Passphrase">
                <SecretBackupStepView credentials={credentials} onSuccess={() => updateCurrentStatus('finished')}/>
            </SoloLayoutView>
        case 'finished':
            if (actionContext.intent) {
                actionContext.selectAccount(credentials.account)
                navigation.navigate('/confirm')
            } else {
                navigation.navigate('/account')
            }
            return null
        default:
            throw new Error(`Unknown signup status: ${status}`)
    }
}
