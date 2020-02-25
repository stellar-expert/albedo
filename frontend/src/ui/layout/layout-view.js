import React from 'react'
import AuthRequestView from '../authentication/authorization-request-view'
import notificationService from '../../state/notifications'
import Logo from './logo-view'
import {Route} from 'react-router'

function registerProtocolHandler() {
    navigator.registerProtocolHandler('web+stellar', 'https://localhost:5001/confirm?sep0007link=%s', 'Albedo')
}

export default function LayoutView({children}) {
    return <>
        <div style={{textAlign: 'center', padding: '0.3em', background: '#DDD', marginBottom: '0.5em'}}>
            <a href="/demo" target="_blank">It's a demo for developers.</a> Do not store private keys from your wallets
            here.
        </div>
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
            <AuthRequestView/>
            <header>
                <Logo/>
            </header>
        </div>
        <div className="page-container">
            {children}
        </div>
        <div className="dimmed text-center space container">
            <div className="copyright">
                2020&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
            </div>
            <div>
                by StellarExpert team&emsp;
                <a href="mailto:orbit.lens@gmail.com" target="_blank" className="dimmed">
                    <i className="fa fa-envelope-o"/> Contact by email
                </a>
            </div>
            {/*<div>
                    <button onClick={registerProtocolHandler}>registerProtocolHandler</button>
                </div>*/}
        </div>
    </>
}
