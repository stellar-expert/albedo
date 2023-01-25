import React from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import wcSessions from '../../../state/wc-sessions'
import accountManager from '../../../state/account-manager'
import walletConnect from '../wallet-connect-adapter'

export default observer(function WcSessionsView() {
    return <div>
        <h2>Connected WalletConnect apps</h2>
        <div className="space">
            {!wcSessions.sessions.length && <div className="space text-small text-center">
                (no active sessions)
            </div>}
            {wcSessions.sessions.map(({id, metadata: meta, pubkey}, i) => <div key={id} className="row space">
                {i > 0 && <hr/>}
                <div className="column column-20 text-center">
                    <div style={{padding: '0.3em'}}>
                        <a href={meta.url} rel="noreferrer nofollow" target="_blank">
                            <img src={meta.icon} style={{maxWidth: '100%'}} rel="noreferrer"/>
                            <div className="text-tiny">
                                {meta.name}
                            </div>
                        </a>
                    </div>
                </div>
                <div className="column column-80 text-small">
                    <h3 style={{margin: 0}}>Active session</h3>
                    <span className="dimmed">account: </span>{accountManager.get(pubkey).displayName}
                    <div className="row">
                        <div className="column column-50 column-offset-50">
                            <Button outline block onClick={() => walletConnect.approveWcRequest()}>Disconnect</Button>
                        </div>
                    </div>
                </div>
            </div>)}
        </div>
    </div>
})