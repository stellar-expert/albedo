import React, {useState} from 'react'

export default function AccountFriendlyNameView({credentials}) {
    if (!credentials) return null
    const {account} = credentials,
        [name, setName] = useState(account.friendlyName)

    function saveFriendlyName() {
        if (account.friendlyName !== name) {
            account.friendlyName = name
            account.save(credentials)
        }
    }

    return <div className="space">
        <label>Friendly name
            <input name="friendly-name" placeholder="i.e. 'Primary Account' or 'Reserve Funds'" maxLength={15}
                   value={name} onChange={e => setName(e.target.value.substr(0, 15))}
                   style={{marginBottom:0}}
                   onKeyDown={e => e.keyCode === 13 && saveFriendlyName()} onBlur={() => saveFriendlyName()}/>
        </label>
        <div className="text-small dimmed">
            Setting friendly name makes it easier to identify an account when you are using more than one.
        </div>
    </div>
}