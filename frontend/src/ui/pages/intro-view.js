import React, {useState} from 'react'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import {registerProtocolHandler} from '../../util/protocol-handler'
import './intro.scss'
import {isInsideFrame} from '../../util/frame-utils'
import UserFeaturesView from './user-features-view'
import DeveloperFeaturesView from './developer-features-view'


function IntroView() {
    const loggedIn = !!accountManager.accounts.length
    const [adv, setAdv] = useState('user')

    function ToggleLink({link, children}) {
        return link === adv ? <span style={{borderBottom: '1px solid #999'}}>{children}</span> :
            <a href="#" onClick={() => setAdv(link)}>
                {children}
            </a>
    }

    return <div className="double-space">
        <div className="v-center-block text-center" style={{minHeight: '50vh'}}>
            <div>
                <h2>Single access point to Stellar universe</h2>
                <div className="double-space">
                    Albedo allows other Stellar apps to request transaction signing or
                    identity verification without ever exposing your secret key
                </div>
                <div className="double-space">
                    {loggedIn ?
                        <a className="button button-outline" href="/account">Manage your account</a> :
                        <a className="button button-outline" href="/signup">Create Albedo account</a>}
                </div>
            </div>
        </div>
        <div>
            <h3 className="text-center">
                Highlights
                <div className="text-small dimmed">for</div>
                <ToggleLink link="user">Users</ToggleLink>
                &nbsp;/&nbsp;
                <ToggleLink link="dev">Developers</ToggleLink>
            </h3>
            {adv === 'user' && <UserFeaturesView/>}
            {adv === 'dev' && <DeveloperFeaturesView/>}
        </div>
        <div className="double-space"/>
        <div>
            {!isInsideFrame() && <>
                <a href="/install-extension" className="button button-outline button-block">Get browser
                    extension</a>
                <a href="#" onClick={() => registerProtocolHandler()}
                   className="button button-outline button-block">Install as web+stellar handler</a>
            </>}
            <a href="/playground" target="_blank" className="button button-outline button-block">
                Developer playground
            </a>
        </div>
        <div className="double-space"/>
    </div>
}

export default observer(IntroView)
