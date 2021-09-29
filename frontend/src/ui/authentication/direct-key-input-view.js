import React, {useState} from 'react'
import {StrKey} from 'stellar-sdk'
import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import actionContext from '../../state/action-context'
import {useAutoFocusRef} from '../components/autofocus-hooks'

function DirectKeyInputView() {
    const [secret, setSecret] = useState(''),
        isValid = StrKey.isValidEd25519SecretSeed(secret),
        inputRef = useAutoFocusRef()

    function setKey(secret) {
        setSecret(secret.replace(/[^a-zA-Z\d]/g, ''))
    }

    function sign() {
        if (isValid) {
            runInAction(() => {
                actionContext.secret = secret
                actionContext.confirmRequest()
                    .catch(err => console.error(err))
            })
        }
    }

    if (actionContext.confirmed) return null

    return <>
        <div className="dimmed text-small">Provide a secret key you'd like to use:</div>
        <div className="micro-space">
            <input type="text" onChange={e => setKey(e.target.value)} ref={inputRef}
                   placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"/>
        </div>
        <div>
            <Button block disabled={!isValid} onClick={sign}>Sign directly</Button>
        </div>
    </>
}

export default observer(DirectKeyInputView)