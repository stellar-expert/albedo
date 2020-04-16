import React from 'react'
import AuthRequestView from '../authentication/authorization-request-view'
import notificationService from '../../state/notifications'
import Logo from './logo-view'
import {observer} from 'mobx-react'
import authorizationService from '../../state/authorization'

function LayoutView({children}) {
    return <>
        <div style={{
            textAlign: 'center',
            padding: '0.3em',
            background: '#DDD',
            marginBottom: '0.5em',
            display: notificationService.notification.show ? 'inline' : 'none'
        }}>
            You have made changes to your keypairs list. Do you want to back up it?
        </div>
        <div className="container">
            <header>
                <Logo/>
            </header>
        </div>
        <div className="page-container container space">
            {authorizationService.dialogOpen ? <AuthRequestView/> : children}
        </div>
        <div className="dimmed text-center space container" style={{fontSize: '0.7em'}}>
            <div className="copyright">
                2020&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
            </div>
            <div>
                by StellarExpert team&emsp;
                <a href="mailto:orbit.lens@gmail.com" target="_blank" className="dimmed">
                    <i className="fa fa-envelope-o"/> Contact us
                </a>&emsp;
                <a href="https://github.com/stellar-expert/albedo" target="_blank" className="dimmed">
                    <i className="fa fa-github"/> Open Source
                </a>
            </div>
        </div>
    </>
}

export default observer(LayoutView)