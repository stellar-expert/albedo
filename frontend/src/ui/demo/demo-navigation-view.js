import React from 'react'
import {intentInterface} from '@albedo-link/intent'
import {useLocation} from 'react-router'
import {parseQuery} from '../../util/url-utils'

const allSections = [
    'intro',
    //'showcase',
    'public_key',
    //'basic_info',
    'sign_message',
    'tx',
    'pay',
    'trust',
    'exchange',
    'implicit_flow'
]

export default function DemoNavigationView() {
    const location = useLocation()
    const {section: activeSection} = parseQuery(location.search)
    return <ul>
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
                    <b>{title}</b> :
                    <a href={'/playground?section=' + section}>{title}</a>
                }
            </li>
        })}
    </ul>
}