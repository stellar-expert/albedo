import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import WideLayout from '../layout/wide-layout-view'
import IntentBlock from './demo-intent-block/demo-intent-block-view'
import DemoIntroView from './demo-intro-view'
import DemoNavigationView from './demo-navigation-view'

export default function DemoView() {
    const location = useLocation(),
        {section = 'intro'} = parseQuery(location.search)

    return <WideLayout>
        <div className="row wide no-center">
            <div className="column">
                <h2>Demos & How-To</h2>
                <div className="row">
                    <div className="column column-33">
                        <div className="segment space">
                            <DemoNavigationView/>
                        </div>
                        <div className="space"/>
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
    </WideLayout>
}