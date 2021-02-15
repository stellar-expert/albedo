import React from 'react'
import {observer} from 'mobx-react'
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
                2020&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
            </div>
            <div>
                <a href="mailto:orbit@stellar.expert" target="_blank" className="dimmed">
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