import React from 'react'
import IntentBlock from './demo-intent-block/demo-intent-block-view'
import DemoIntroView from './demo-intro-view'
import DemoNavigationView from './demo-navigation-view'
import {useLocation} from 'react-router'
import {parseQuery} from '../../util/url-utils'

export default function DemoView() {
    const location = useLocation(),
        {section = 'intro'} = parseQuery(location.search)

    return <div className="row wide no-center">
        <div className="column">
            <h2>Demos & How-To</h2>
            <div className="row">
                <div className="column column-33">
                    <div className="segment" style={{marginLeft: '-0.5em', padding: '0.5em 1em'}}>
                        <DemoNavigationView/>
                    </div>
                </div>
                <div className="column column-66">
                    {section === 'intro' ?
                        <DemoIntroView/> :
                        <IntentBlock intent={section}/>
                    }
                </div>
            </div>
        </div>
    </div>
}