import React, {useState} from 'react'

export default function AccountSecretKeyView({credentials}) {
    if (!credentials) return null
    //secret key
    const [secret, setSecret] = useState('')

    function revealSecret() {
        const plainSecret = credentials.account.requestAccountSecret(credentials)
        setSecret(plainSecret)
    }

    return <>
        <div className="dual-layout">
            <div>Secret key</div>
            <div>
                {!secret ?
                    <a href="#" onClick={revealSecret}>Reveal</a> :
                    <a href="#" onClick={() => setSecret('')}>Hide</a>}
            </div>
        </div>
        <div>
             <textarea readOnly value={secret} style={{height: '2.5em', color: '#f10000'}}
                       placeholder={'(hidden, click "Reveal" to show it)'} onFocus={e => e.target.select()}/>
        </div>
    </>
}