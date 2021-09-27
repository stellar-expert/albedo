import React from 'react'
import {observer} from 'mobx-react'
import {ThemeSelector} from '@stellar-expert/ui-framework'
import Logo from './logo-view'
import DialogContainer from './dialog-container-view'

function LayoutView({children}) {
    return <>
        <div className="container text-right">
            <Logo/>
        </div>
        <div className="page-container container space">
            {children}
        </div>
        <DialogContainer/>
        <div className="dimmed text-center text-small container">
            <div className="space"/>
            <div className="copyright">
                2021&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
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

export default observer(LayoutView)