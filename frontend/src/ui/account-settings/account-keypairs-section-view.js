import React from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import KeypairOption from '../keypair/keypair-view'

function AccountKeypairsSectionView() {
    const {activeAccount} = accountManager
    return <div className="space">
        <div className="dimmed text-small">
            Here you can manage your existing signing keys or add new one. Those keys are used to sign Stellar
            transactions and authenticate account identity on third-party services.
        </div>
        <ul className="space">
            {activeAccount.keypairs.map(kp => <li key={kp.publicKey}>
                <KeypairOption account={activeAccount} keypair={kp}/>
            </li>)}
        </ul>
        <div className="space">
            <a href="/account/add-keypair" className="button">Add new signing key</a>
        </div>
    </div>
}

export default observer(AccountKeypairsSectionView)