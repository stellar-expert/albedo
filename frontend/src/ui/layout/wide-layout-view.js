import React from 'react'
import {observer} from 'mobx-react'
import {ThemeSelector, SystemDialog} from '@stellar-expert/ui-framework'
import Logo from './logo-view'
import AuthDialog from './auth-dialog-view'

function WideLayoutView({children}) {
    return <>
        <div className="container wide text-right">
            <Logo/>
        </div>
        <div className="page-container container wide space" style={{minHeight: 'calc(100vh - 8rem)'}}>
            {children}
        </div>
        <AuthDialog/>
        <SystemDialog/>
        <div className="container wide dimmed text-center text-small">
            <div className="space"/>
            <div className="copyright">
                {new Date().getFullYear()}&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
            </div>
            <div style={{paddingBottom: '1em'}}>
                <a href="mailto:info@stellar.expert" target="_blank" className="dimmed">
                    <i className="icon-email"/> Contact us
                </a>&emsp;
                <a href="https://github.com/stellar-expert/albedo" target="_blank" className="dimmed">
                    <i className="icon-github"/> Source code
                </a>&emsp;
                <ThemeSelector/>
            </div>
        </div>
    </>
}

export default observer(WideLayoutView)