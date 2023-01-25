import React from 'react'
import cn from 'classnames'
import {ThemeSelector} from '@stellar-expert/ui-framework'
import './solo-layout.scss'

export default function SoloLayoutView({title, alignTop = false, children}) {
    return <>
        {!!title && <>
            <h2 style={{marginBottom: 0}}>{title}</h2>
            <hr className="flare"/>
            <div className="space"/>
        </>}
        <div className={cn('solo-layout', {'no-title': !title, 'align-top': alignTop})}>
            <div>
                {children}
            </div>
        </div>
        <div className="dimmed text-center text-small container">
            <div className="space"/>
            <div className="copyright">
                {new Date().getUTCFullYear()}&nbsp;©&nbsp;Albedo <span className="dimmed">v{appVersion}</span>
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