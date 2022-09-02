import React, {useState, useEffect} from 'react'
import {observer} from 'mobx-react'
import {navigation} from '@stellar-expert/navigation'
import errors from '../../util/errors'
import accountManager from '../../state/account-manager'
import Account from '../../state/account'
import Credentials from '../../state/auth/credentials'
import CredentialsRequest from './credentials-request-view'
import authorizationService from '../../state/auth/authorization'

export default observer(function AuthorizationRequestView() {
    const [account, setAccount] = useState(null),
        [inProgress, setInProgress] = useState(false),
        [error, setError] = useState(null)

    useEffect(() => {
        const selectedAccount = authorizationService.account
        setAccount(selectedAccount)
        return () => {
            window.requestAuthorization = undefined
        }
    })

    async function submit(data) {
        setInProgress(true)
        setError(null)
        const {id, password} = data,
            selectedAccount = account || accountManager.get(id) || new Account({id}),
            credentials = await Credentials.create({account: selectedAccount, password})

        if (!credentials.checkPasswordCorrect()) {
            setInProgress(false)
            setError('Invalid password')
            return
        }
        try {
            authorizationService.credentialsRequestCallback.resolve(credentials)
            //restore default state
            setAccount(null)
            setInProgress(false)
            setError(null)
        } catch (e) {
            setInProgress(false)
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

    function cancel() {
        if (authorizationService.credentialsRequestCallback) {
            authorizationService.credentialsRequestCallback.reject(errors.actionRejectedByUser)
        } else {
            navigation.navigate('/')
        }
    }

    if (!authorizationService.dialogOpen) return null
    if (!account) return null
    return <div>
        <h2>Authorization for {account.friendlyName}</h2>
        <div className="space text-small dimmed">
            Please provide your password
        </div>
        <CredentialsRequest confirmText="Confirm" noRegistrationLink {...{inProgress, error}} onConfirm={submit}
                            onCancel={cancel}/>
    </div>
})
