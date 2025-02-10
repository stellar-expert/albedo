import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import accountManager from '../../state/account-manager'
import {isInsideFrame} from '../../util/frame-utils'
import {registerProtocolHandler} from '../../util/protocol-handler'
import SoloLayoutView from '../layout/solo-layout-view'
import DeveloperFeaturesView from './developer-features-view'
import UserFeaturesView from './user-features-view'
import './intro.scss'

function IntroView() {
    const loggedIn = !!accountManager.accounts.length
    const [adv, setAdv] = useState('user')

    function ToggleLink({link, children}) {
        return link === adv ? <span style={{borderBottom: '1px solid #999'}}>{children}</span> :
            <a href="#" onClick={() => setAdv(link)}>
                {children}
            </a>
    }

    return <SoloLayoutView>
        <div className="v-center-block text-center" style={{minHeight: '60vh'}}>
            <div>
                <h2>Single access point to Stellar universe</h2>
                <div className="double-space">
                    Albedo allows other Stellar apps to request transaction signing or
                    identity verification without ever exposing your secret key
                </div>
                <div className="double-space">
                    {loggedIn ?
                        <Button outline href="/account">Manage your account</Button> :
                        <Button outline href="/signup">Create Albedo account</Button>}
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
                <Button block outline href="#" onClick={() => registerProtocolHandler()}>Install as web+stellar handler</Button>
            </>}
            <Button block outline href="/playground" target="_blank">Developer playground </Button>
        </div>
        <div className="double-space"/>
    </SoloLayoutView>
}

export default observer(IntroView)
