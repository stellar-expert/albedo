import React from 'react'
import cn from 'classnames'
import AccountBalance from './account-balance-view'
import dashboardSettings from '../../state/dashboard-settings'

function AccountDashboardView({account}) {
    return <div>
        <h2>Account <a href="/account" title="Account settings">{account.displayName} <i style={{fontSize: '0.7em'}}
                                                                                         className="fa fa-cog"/></a>
        </h2>
        <div>
            {account.keypairs.map(kp => <div className="space" key={kp.publicKey}>
                <div><span className="dimmed">Keypair</span> {kp.displayName}</div>
                <div className="micro-space">
                    <AccountBalance address={kp.publicKey}/>
                </div>
            </div>)}
        </div>
    </div>
}

export default AccountDashboardView

