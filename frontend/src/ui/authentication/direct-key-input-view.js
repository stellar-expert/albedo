import React, {useState} from 'react'
import {StrKey} from 'stellar-sdk'
import actionContext from '../../state/action-context'

export default function DirectKeyInputView() {
    const [secret, setSecret] = useState(''),
        isValid = StrKey.isValidEd25519SecretSeed(secret)

    function setKey(secret) {
        setSecret(secret.replace(/[^a-zA-Z\d]/g, ''))
    }

    function sign() {
        if (isValid) {
            actionContext.secret = secret
            actionContext.confirmRequest()
                .catch(err => console.error(err))
            actionContext.directKeyInput = false
        }
    }

    return <>
        <div className="dimmed text-small">Provide a secret key you'd like to use:</div>
        <div className="micro-space">
            <input type="text" onChange={e => setKey(e.target.value)}
                   placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"/>
        </div>
        <div>
            <button className="button" disabled={!isValid} onClick={() => sign()}>Sign directly</button>
        </div>
    </>
}