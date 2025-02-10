import React from 'react'
import {SystemDialog} from '@stellar-expert/ui-framework'
import Logo from './logo-view'
import AuthDialog from './auth-dialog-view'
import OpenNewWindowView from './open-new-window-view'

export default function LayoutView({children}) {
    return <>
        <OpenNewWindowView/>
        <div className="container text-right">
            <Logo/>
        </div>
        <div className="page-container container space">
            {children}
        </div>
        <AuthDialog/>
        <SystemDialog/>
    </>
}
