import React from 'react'
import {useLocation} from 'react-router'
import {intentInterface} from '@albedo-link/intent'
import {parseQuery} from '@stellar-expert/navigation'

const allSections = [
    'intro',
    'public_key',
    'sign_message',
    'tx',
    'pay',
    'trust',
    'exchange',
    'implicit_flow',
    'manage_account',
    'batch'
]

export default function DemoNavigationView() {
    const location = useLocation()
    const {section: activeSection = 'intro'} = parseQuery(location.search)
    return <ul style={{margin: 0}}>
        {allSections.map(section => {
            let title = section
            const intentContract = intentInterface[section]
            if (intentContract) {
                title = intentContract.title
            }
            if (section === 'intro') {
                title = 'Introduction'
            }
            return <li key={section} style={{padding: '0.3em 0'}}>
                {section === activeSection ?
                    <span><i className="icon-angle-double-right"/>{title}</span> :
                    <a href={'/playground?section=' + section}>{title}</a>
                }
            </li>
        })}
    </ul>
}