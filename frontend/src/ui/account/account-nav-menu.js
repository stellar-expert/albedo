import React from 'react'
import {useLocation} from 'react-router'
import cn from 'classnames'
import {useStellarNetwork} from '@stellar-expert/ui-framework'

function NavLink({link, icon, title, current}) {
    return <a href={link} className={cn('condensed', {current})}>
        <i className={icon}/>{title}
    </a>
}

const links = [
    {link: '/wallet/swap', icon: 'icon-trade', title: 'Trade'},
    {link: '/wallet/transfer', icon: 'icon-send-circle', title: 'Send'},
    {link: '/wallet/receive', icon: 'icon-receive-circle', title: 'Receive'},
    {link: '/wallet/scan', icon: 'icon-scan-qr-code', title: 'Scan'},
    {link: '/', icon: 'icon-coins', title: 'Balance'}
]

export default function AccountNavMenu() {
    useStellarNetwork()
    const {pathname} = useLocation()
    return <>
        {/*this div is a placeholder that adds scroll to the window to prevent covering the content with navigation*/}
        <div style={{paddingTop: '6em'}}/>
        <div className="container navigation">
            {links.map(item => <NavLink key={item.icon} {...item} current={pathname === item.link}/>)}
        </div>
    </>
}