import React, {useState} from 'react'
import {secretToMnemonic} from '../../../util/mnemonic'

export default function AccountPassphraseView({credentials}) {
    if (!credentials) return null
    const [secret, setSecret] = useState('')

    function revealSecret() {
        const plainSecret = credentials.account.requestAccountSecret(credentials)
        setSecret(plainSecret)
    }

    return <>
        <div className="dual-layout">
            <div>Account passphrase</div>
            <div>
                {!secret ?
                    <a href="#" onClick={revealSecret}>Reveal</a> :
                    <a href="#" onClick={() => setSecret('')}>Hide</a>}
            </div>
        </div>
        <div>
             <textarea readOnly style={{height: '5.2em', color: '#F10000'}}
                       value={secret ? secretToMnemonic(secret) : ''} onFocus={e => e.target.select()}
                       placeholder={'(hidden, click "Reveal" to show it)'}/>
        </div>
    </>
}