import React from 'react'
import {useLocation} from 'react-router'
import cn from 'classnames'

function NavLink({link, icon, title, current}) {
    return <a href={link} className={cn({current})}>
        <i className={icon}/>
        {title}</a>
}

export default function AccountNavMenu() {
    const location = useLocation()

    const links = [
        {link: '/wallet/transfer', icon: 'icon-flash', title: 'Transfer'},
        {link: '/wallet/swap', icon: 'icon-switch', title: 'Swap'},
        {link: '/account', icon: 'icon-key', title: 'Balance'},
        {link: '/account-settings', icon: 'icon-settings', title: 'Settings'}
    ]

    return <div className="micro-space navigation">
        {links.map(link => <NavLink {...link}/>)}
    </div>
}