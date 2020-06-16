import React, {useState} from 'react'
import OnBoardingNotesStepView from './onboarding-notes-step-view'
import SecretBackupStepView from './secret-backup-step-view'
import SignupSetPasswordStepView from './signup-set-password-step-view'
import actionContext from '../../state/action-context'

function SignupView({secret, skipSecretBackup}) {
    const [status, setStatus] = useState('onboarding'),
        [credentials, setCredentials] = useState(null)

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
            return <>
                <h2>Welcome to Albedo</h2>
                <OnBoardingNotesStepView onSuccess={() => updateCurrentStatus('password')}/>
            </>
        case 'password':
            return <>
                <h2>Set Account Password</h2>
                <SignupSetPasswordStepView secret={secret} onSuccess={(credentials) => {
                    setCredentials(credentials)
                    updateCurrentStatus('backup')
                }}/>
            </>
        case 'backup':
            if (skipSecretBackup || !credentials || !credentials.account.isStoredAccount) {
                updateCurrentStatus('finished')
                return null
            }
            return <>
                <h2>Recovery Passphrase</h2>
                <SecretBackupStepView credentials={credentials} onSuccess={() => updateCurrentStatus('finished')}/>
            </>
        case 'finished':
            __history.push(actionContext.intent ? '/confirm' : '/account')
            return null
        default:
            throw new Error(`Unknown signup status: ${status}`)
    }
}

export default SignupView
