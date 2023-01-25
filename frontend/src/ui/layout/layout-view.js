import React from 'react'
import Logo from './logo-view'
import DialogContainer from './dialog-container-view'
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
        <DialogContainer/>
    </>
}
